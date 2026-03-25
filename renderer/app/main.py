import os
import uuid
import json
import asyncio
import base64
import subprocess
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings
import aioboto3
import httpx
from botocore.config import Config
from botocore.exceptions import ClientError

# ─── Configuration ──────────────────────────────────────────
class Settings(BaseSettings):
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "launchframe"
    USE_SSL: bool = False

    class Config:
        env_file = ".env"

settings = Settings()

app = FastAPI(title="Launchframe Renderer", version="0.1.0")

# ─── Models ───────────────────────────────────────────────
class RenderRequest(BaseModel):
    video_id: str
    script: dict  # Full VideoScript JSON from ScriptGen + TTS results

class RenderResponse(BaseModel):
    video_url: str
    video_id: str


async def collect_scene_audio_files(script: dict, render_id: str) -> list[str]:
    """Extract audio clips from script scene `audio_url` and save to local temp files."""
    audio_files: list[str] = []
    scenes = script.get("scenes", []) if isinstance(script, dict) else []

    async with httpx.AsyncClient(timeout=60.0) as client:
        for idx, scene in enumerate(scenes):
            src = (scene or {}).get("audio_url")
            if not src:
                continue

            target = f"/tmp/{render_id}_scene_{idx}.wav"
            if isinstance(src, str) and src.startswith("data:audio/"):
                try:
                    _, b64_data = src.split(",", 1)
                    with open(target, "wb") as out:
                        out.write(base64.b64decode(b64_data))
                    audio_files.append(target)
                except Exception:
                    continue
            elif isinstance(src, str) and src.startswith(("http://", "https://")):
                try:
                    resp = await client.get(src)
                    resp.raise_for_status()
                    with open(target, "wb") as out:
                        out.write(resp.content)
                    audio_files.append(target)
                except Exception:
                    continue

    return audio_files


async def mux_audio_into_video(video_path: str, audio_files: list[str], render_id: str) -> str:
    """Concatenate scene audio clips and mux into rendered mp4. Falls back to video-only on failure."""
    if not audio_files:
        return video_path

    concat_list = f"/tmp/{render_id}_audio_list.txt"
    concat_audio = f"/tmp/{render_id}_audio.m4a"
    merged_output = f"/tmp/{render_id}_with_audio.mp4"

    try:
        with open(concat_list, "w") as f:
            for path in audio_files:
                f.write(f"file '{path}'\n")

        concat_cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list,
            "-c:a", "aac",
            concat_audio,
        ]
        proc1 = await asyncio.create_subprocess_exec(
            *concat_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, err1 = await proc1.communicate()
        if proc1.returncode != 0:
            return video_path

        mux_cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-i", concat_audio,
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            merged_output,
        ]
        proc2 = await asyncio.create_subprocess_exec(
            *mux_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, err2 = await proc2.communicate()
        if proc2.returncode != 0:
            return video_path

        return merged_output
    except Exception:
        return video_path

# ─── S3 Helper ────────────────────────────────────────────
async def upload_to_s3(file_path: str, key: str, content_type: str = "video/mp4"):
    session = aioboto3.Session()
    async with session.client(
        's3',
        endpoint_url=f"{"https" if settings.USE_SSL else "http"}://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version='s3v4')
    ) as s3:
        try:
            await s3.head_bucket(Bucket=settings.MINIO_BUCKET)
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code", "")
            if error_code in {"404", "NoSuchBucket", "NotFound"}:
                await s3.create_bucket(Bucket=settings.MINIO_BUCKET)
            else:
                raise
        with open(file_path, "rb") as f:
            await s3.put_object(
                Bucket=settings.MINIO_BUCKET,
                Key=key,
                Body=f,
                ContentType=content_type
            )
    return f"{settings.MINIO_BUCKET}/{key}"

# ─── Routes ───────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "renderer"}

@app.post("/render", response_model=RenderResponse)
async def render(request: RenderRequest):
    render_id = str(uuid.uuid4())
    output_path = f"/tmp/{render_id}.mp4"
    props_path = f"/tmp/{render_id}.json"
    upload_path = output_path

    try:
        # 1. Write props to file for Remotion CLI
        with open(props_path, "w") as f:
            json.dump(request.script, f)

        # 2. Run Remotion Render
        # cmd: npx remotion render src/index.ts MyVideo out.mp4 --props props.json
        cmd = [
            "npx", "remotion", "render",
            "src/index.ts", "MyVideo",
            output_path,
            "--props", props_path,
            "--concurrency", "4"
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd="/app"
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Remotion Render Failed: {stderr.decode()}"
            )

        # 3. Attach generated scene audio to ensure audible output
        audio_files = await collect_scene_audio_files(request.script, render_id)
        upload_path = await mux_audio_into_video(output_path, audio_files, render_id)

        # 4. Upload to MinIO
        key = f"projects/{request.video_id}/final_{render_id}.mp4"
        video_url = await upload_to_s3(upload_path, key)

        # 5. Cleanup
        if os.path.exists(output_path): os.remove(output_path)
        if upload_path != output_path and os.path.exists(upload_path): os.remove(upload_path)
        if os.path.exists(props_path): os.remove(props_path)
        for tmp in os.listdir("/tmp"):
            if tmp.startswith(f"{render_id}_scene_") or tmp.startswith(f"{render_id}_audio"):
                try:
                    os.remove(f"/tmp/{tmp}")
                except Exception:
                    pass

        return RenderResponse(
            video_url=video_url,
            video_id=request.video_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
