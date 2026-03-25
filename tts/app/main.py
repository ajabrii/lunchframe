import os
import uuid
import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings
import aioboto3
from botocore.config import Config
from botocore.exceptions import ClientError
import numpy as np

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

app = FastAPI(title="Launchframe TTS", version="0.1.0")

# ─── Models ───────────────────────────────────────────────
class TTSRequest(BaseModel):
    lines: List[str]
    voice_id: str = "nova"
    project_id: str

class TTSResponse(BaseModel):
    audio_urls: List[str]
    voice_id: str

# ─── S3 Helper ────────────────────────────────────────────
async def upload_to_s3(file_data: bytes, key: str, content_type: str = "audio/wav"):
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
        await s3.put_object(
            Bucket=settings.MINIO_BUCKET,
            Key=key,
            Body=file_data,
            ContentType=content_type
        )
    return f"{settings.MINIO_BUCKET}/{key}"

# ─── TTS Inference (Placeholder for Kokoro) ───────────────
async def generate_kokoro_audio(text: str) -> bytes:
    """
    Placeholder for Kokoro ONNX inference.
    In a real environment, this would load the 'kokoro-v0.onnx' model
    and use the 'kokoro-onnx' library to generate 24kHz PCM audio.
    """
    # Simulate processing time
    await asyncio.sleep(1.0)

    # Return 1 second of white noise (placeholder wav)
    # In production, this would be the actual Kokoro output.
    sample_rate = 24000
    duration_sec = 1.0
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec))
    audio_data = (np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)

    from scipy.io import wavfile
    import io

    byte_io = io.BytesIO()
    wavfile.write(byte_io, sample_rate, audio_data)
    return byte_io.getvalue()

# ─── Routes ───────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "tts"}

@app.post("/generate-tts", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    audio_urls = []

    try:
        for idx, line in enumerate(request.lines):
            # 1. Generate Audio (Kokoro placeholder)
            audio_bytes = await generate_kokoro_audio(line)

            # 2. Upload to MinIO
            key = f"projects/{request.project_id}/audio/line_{idx}_{uuid.uuid4()}.wav"
            url = await upload_to_s3(audio_bytes, key)
            audio_urls.append(url)

        return TTSResponse(
            audio_urls=audio_urls,
            voice_id=request.voice_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS Generation Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
