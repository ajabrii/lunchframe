import json
import logging
import os
import asyncio
import uuid
import base64
from typing import Any, Dict

import httpx
import redis
import boto3
from botocore.client import Config as BotoConfig
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.celery_app import celery_app
from app.config import settings
from app.database import async_session
from app.models import Video, Project

logger = logging.getLogger(__name__)

# ─── Redis for SSE Progress ──────────────────────────────
redis_client = redis.Redis.from_url(settings.REDIS_URL)


def _presign_object_path(object_path: str, expires_in: int = 3600) -> str:
    """Convert bucket/key object path to signed URL reachable by services on Docker network."""
    if not object_path or object_path.startswith(("http://", "https://")):
        return object_path
    if "/" not in object_path:
        return object_path

    bucket, key = object_path.split("/", 1)
    client = boto3.client(
        "s3",
        endpoint_url=settings.MINIO_URL,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=BotoConfig(signature_version="s3v4"),
        region_name="us-east-1",
    )
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires_in,
    )


def _object_path_to_data_url(object_path: str) -> str:
    """Load object bytes from MinIO and return a data URL for Remotion audio source."""
    if not object_path or object_path.startswith("data:"):
        return object_path
    if "/" not in object_path:
        return object_path

    bucket, key = object_path.split("/", 1)
    client = boto3.client(
        "s3",
        endpoint_url=settings.MINIO_URL,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=BotoConfig(signature_version="s3v4"),
        region_name="us-east-1",
    )
    obj = client.get_object(Bucket=bucket, Key=key)
    content_type = obj.get("ContentType") or "audio/wav"
    raw = obj["Body"].read()
    encoded = base64.b64encode(raw).decode("ascii")
    return f"data:{content_type};base64,{encoded}"

def _publish_progress(video_id: str, stage: str, percent: int, message: str):
    """Publish progress update to Redis for SSE streaming."""
    redis_client.publish(
        f"video:{video_id}",
        json.dumps({"stage": stage, "percent": percent, "message": message}),
    )

# ─── Database Helpers ─────────────────────────────────────
async def _update_video_status(video_id: str, status: str, **kwargs):
    """Update video record in DB."""
    async with async_session() as session:
        async with session.begin():
            stmt = select(Video).where(Video.id == uuid.UUID(video_id))
            result = await session.execute(stmt)
            video = result.scalar_one_or_none()
            if video:
                video.status = status
                for key, value in kwargs.items():
                    setattr(video, key, value)
                await session.commit()
            return video

# ─── Pipeline Tasks ───────────────────────────────────────
@celery_app.task(bind=True, name="crawl_url")
def crawl_url(self, video_id: str):
    """Phase 2: Crawl the product URL via Crawler Service."""
    _publish_progress(video_id, "crawling", 10, "Initializing headless crawler...")

    async def run_crawl():
        async with async_session() as session:
            stmt = select(Video).where(Video.id == uuid.UUID(video_id))
            res = await session.execute(stmt)
            video = res.scalar_one()
            url = video.source_url
            project_id = str(video.project_id) if video.project_id else "default"

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.CRAWLER_URL}/crawl",
                json={"url": url, "project_id": project_id}
            )
            response.raise_for_status()
            crawl_data = response.json()

            await _update_video_status(
                video_id,
                "crawled",
                crawl_result=crawl_data,
                title=crawl_data.get("title"),
                thumbnail_url=crawl_data.get("screenshot_url")
            )
            _publish_progress(video_id, "crawling", 25, "Product metadata captured.")
            return crawl_data

    return asyncio.run(run_crawl())

@celery_app.task(bind=True, name="generate_script")
def generate_script(self, crawl_data: Dict[str, Any], video_id: str):
    """Phase 2: Generate script via ScriptGen Service."""
    _publish_progress(video_id, "scripting", 40, "Brainstorming video script...")

    async def run_scriptgen():
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.SCRIPTGEN_URL}/generate-script",
                json={
                    "product_name": crawl_data.get("title", "Product"),
                    "product_description": crawl_data.get("description", ""),
                    "brand_colors": crawl_data.get("brand_colors", ["#000000"]),
                }
            )
            response.raise_for_status()
            script_data = response.json()

            # Ensure renderer-required fields are present
            script_data["brand_colors"] = crawl_data.get("brand_colors") or ["#000000", "#FFFFFF"]
            screenshot_url = crawl_data.get("screenshot_url")
            if screenshot_url:
                script_data["screenshot_url"] = _presign_object_path(screenshot_url)

            await _update_video_status(video_id, "scripted", script_json=script_data)
            _publish_progress(video_id, "scripting", 50, "Script finalized.")
            return script_data

    return asyncio.run(run_scriptgen())

@celery_app.task(bind=True, name="generate_tts")
def generate_tts(self, script_data: Dict[str, Any], video_id: str):
    """Phase 2: Generate voiceover segments via TTS Service."""
    _publish_progress(video_id, "tts", 60, "Synthesizing voiceover lines...")

    async def run_tts():
        lines = [scene["voiceover_text"] for scene in script_data.get("scenes", [])]
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.TTS_URL}/generate-tts",
                json={
                    "lines": lines,
                    "project_id": video_id, # Simplified project/video grouping
                    "voice_id": "nova"
                }
            )
            response.raise_for_status()
            tts_data = response.json()

            # Inject generated audio URLs into corresponding scenes for renderer
            scenes = script_data.get("scenes", [])
            audio_urls = tts_data.get("audio_urls", [])
            for idx, scene in enumerate(scenes):
                if idx < len(audio_urls):
                    try:
                        scene["audio_url"] = _object_path_to_data_url(audio_urls[idx])
                    except Exception:
                        scene["audio_url"] = _presign_object_path(audio_urls[idx])

            script_data["scenes"] = scenes

            await _update_video_status(video_id, "vox_generated", script_json=script_data)
            _publish_progress(video_id, "tts", 75, "Audio assets generated.")
            return script_data

    return asyncio.run(run_tts())

@celery_app.task(bind=True, name="render_video")
def render_video(self, script_data: Dict[str, Any], video_id: str):
    """Phase 3: Render the final video via Renderer Service."""
    _publish_progress(video_id, "rendering", 85, "Merging assets into Remotion...")

    async def run_render():
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{settings.RENDERER_URL}/render",
                json={
                    "video_id": video_id,
                    "script": script_data
                }
            )
            response.raise_for_status()
            render_data = response.json()

            await _update_video_status(video_id, "done", video_url=render_data["video_url"])
            _publish_progress(video_id, "rendering", 95, "Video rendered and uploaded.")
            return render_data

    return asyncio.run(run_render())

@celery_app.task(bind=True, name="finalize_video")
def finalize_video(self, prev_result: dict, video_id: str):
    """Finalize: update DB, notify completion."""
    async def run_finalize():
        video = await _update_video_status(video_id, "done")
        redis_client.publish(
            f"video:{video_id}",
            json.dumps(
                {
                    "stage": "done",
                    "percent": 100,
                    "message": "Production complete! Your video is ready.",
                    "video_url": video.video_url if video else None,
                    "thumbnail_url": video.thumbnail_url if video else None,
                    "duration_seconds": video.duration_seconds if video else None,
                }
            ),
        )
        return {"status": "success", "video_id": video_id}

    return asyncio.run(run_finalize())

def generate_video_pipeline(video_id: str):
    """Orchestrate the full pipeline as a Celery chain."""
    from celery import chain

    return chain(
        crawl_url.s(video_id),
        generate_script.s(video_id), # Fixed typo
        generate_tts.s(video_id),
        render_video.s(video_id),
        finalize_video.s(video_id),
    ).apply_async()
