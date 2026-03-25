"""Launchframe — Pipeline Tasks (stubs for Phase 1)."""

import json
import logging
import os

import httpx
import redis

from app.celery_app import celery_app

logger = logging.getLogger(__name__)

redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))

CRAWLER_URL = os.getenv("CRAWLER_URL", "http://crawler:8001")
SCRIPTGEN_URL = os.getenv("SCRIPTGEN_URL", "http://scriptgen:8002")
TTS_URL = os.getenv("TTS_URL", "http://tts:8004")
RENDERER_URL = os.getenv("RENDERER_URL", "http://renderer:8003")


def _publish_progress(video_id: str, stage: str, percent: int, message: str):
    """Publish progress update to Redis for SSE streaming."""
    redis_client.publish(
        f"video:{video_id}",
        json.dumps({"stage": stage, "percent": percent, "message": message}),
    )


@celery_app.task(bind=True, name="crawl_url")
def crawl_url(self, video_id: str):
    """Phase 2: Crawl the product URL."""
    logger.info(f"[STUB] crawl_url for video {video_id}")
    _publish_progress(video_id, "crawling", 10, "Analyzing your product...")
    return {"video_id": video_id, "stage": "crawl", "status": "stub"}


@celery_app.task(bind=True, name="generate_script")
def generate_script(self, prev_result: dict, video_id: str):
    """Phase 2: Generate video script from crawl result."""
    logger.info(f"[STUB] generate_script for video {video_id}")
    _publish_progress(video_id, "scripting", 30, "Writing your video script...")
    return {"video_id": video_id, "stage": "script", "status": "stub"}


@celery_app.task(bind=True, name="generate_tts")
def generate_tts(self, prev_result: dict, video_id: str):
    """Phase 2: Generate TTS audio."""
    logger.info(f"[STUB] generate_tts for video {video_id}")
    _publish_progress(video_id, "tts", 60, "Generating voiceover...")
    return {"video_id": video_id, "stage": "tts", "status": "stub"}


@celery_app.task(bind=True, name="render_video")
def render_video(self, prev_result: dict, video_id: str):
    """Phase 3: Render the final video."""
    logger.info(f"[STUB] render_video for video {video_id}")
    _publish_progress(video_id, "rendering", 80, "Rendering video...")
    return {"video_id": video_id, "stage": "render", "status": "stub"}


@celery_app.task(bind=True, name="finalize_video")
def finalize_video(self, prev_result: dict, video_id: str):
    """Finalize: update DB, notify user."""
    logger.info(f"[STUB] finalize_video for video {video_id}")
    _publish_progress(video_id, "complete", 100, "Video ready!")
    return {"video_id": video_id, "stage": "complete", "status": "stub"}


def generate_video_pipeline(video_id: str):
    """Orchestrate the full pipeline as a Celery chain."""
    from celery import chain

    return chain(
        crawl_url.s(video_id),
        generate_script.s(video_id),
        generate_tts.s(video_id),
        render_video.s(video_id),
        finalize_video.s(video_id),
    ).apply_async()
