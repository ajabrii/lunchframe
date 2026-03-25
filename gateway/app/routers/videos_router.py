"""Launchframe — Videos Router (Phase 2)."""

import json
import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis
from celery import chain
import boto3
from botocore.client import Config as BotoConfig

from app.auth import get_current_user
from app.database import get_db
from app.models import User, Video, Template
from app.schemas import VideoGenerateRequest, VideoResponse, VideoGenerateResponse, VideoListResponse, VideoEditRequest
from app.config import settings
from app.celery_utils import celery_app

router = APIRouter(prefix="/v1/videos", tags=["videos"])
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def _create_presigned_get_url(object_path: str, expires_in: int = 3600) -> str:
    """Create a browser-accessible pre-signed URL for a MinIO object path bucket/key."""
    if "/" not in object_path:
        raise ValueError("Invalid object path")

    bucket, key = object_path.split("/", 1)
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.MINIO_PUBLIC_URL,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=BotoConfig(signature_version="s3v4"),
        region_name="us-east-1",
    )

    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires_in,
    )


def _with_signed_thumbnail(video: Video) -> VideoResponse:
    payload = VideoResponse.model_validate(video).model_dump()
    thumb = payload.get("thumbnail_url")
    if thumb and not str(thumb).startswith(("http://", "https://")):
        try:
            payload["thumbnail_url"] = _create_presigned_get_url(str(thumb), expires_in=3600)
        except Exception:
            # Keep original value if signing fails
            pass
    return VideoResponse(**payload)

@router.post("/generate", response_model=VideoGenerateResponse)
async def generate_video(
    request: VideoGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a video generation job."""

    # 1. Validate Template
    stmt = select(Template).where(Template.id == request.template_id)
    result = await db.execute(stmt)
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # 2. Create Video Object
    video = Video(
        user_id=current_user.id,
        project_id=request.project_id,
        template_id=request.template_id,
        source_url=request.url,
        user_prompt=request.prompt,
        target_duration=request.target_duration,
        status="pending"
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)

    # 3. Dispatch full Celery pipeline
    job = chain(
        celery_app.signature("crawl_url", args=[str(video.id)]),
        celery_app.signature("generate_script", args=[str(video.id)]),
        celery_app.signature("generate_tts", args=[str(video.id)]),
        celery_app.signature("render_video", args=[str(video.id)]),
        celery_app.signature("finalize_video", args=[str(video.id)]),
    ).apply_async()

    video.celery_task_id = job.id
    await db.commit()

    return VideoGenerateResponse(
        video_id=video.id,
        job_id=job.id,
        status="pending"
    )

@router.get("/{video_id}/status")
async def video_status(
    video_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """SSE status stream for a video generation job."""
    # Verify ownership
    stmt = select(Video).where(Video.id == video_id, Video.user_id == current_user.id)
    result = await db.execute(stmt)
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    async def event_generator():
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(f"video:{video_id}")

        try:
            # Send initial state
            yield f"data: {json.dumps({'stage': 'pending', 'percent': 0, 'message': 'Job submitted'})}\\n\\n"

            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    yield f"data: {message['data']}\\n\\n"

                await asyncio.sleep(0.5)
        finally:
            await pubsub.unsubscribe(f"video:{video_id}")

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("", response_model=VideoListResponse)
async def list_videos(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's videos."""
    offset = (page - 1) * limit
    stmt = select(Video).where(Video.user_id == current_user.id).order_by(Video.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    videos = result.scalars().all()

    # Simple count for pagination
    count_stmt = select(Video).where(Video.user_id == current_user.id)
    # Note: In a real app we'd use func.count()

    return VideoListResponse(
        videos=[_with_signed_thumbnail(v) for v in videos],
        total=len(videos),
        page=page
    )

@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get video details."""
    stmt = select(Video).where(Video.id == video_id, Video.user_id == current_user.id)
    result = await db.execute(stmt)
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return _with_signed_thumbnail(video)


@router.get("/{video_id}/play-url")
async def get_video_play_url(
    video_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Return a short-lived signed URL to play the rendered video."""
    stmt = select(Video).where(Video.id == video_id, Video.user_id == current_user.id)
    result = await db.execute(stmt)
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video.video_url:
        raise HTTPException(status_code=409, detail="Video is not ready yet")

    try:
        url = _create_presigned_get_url(video.video_url)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not create playback URL")

    return {"url": url, "expires_in": 3600}


@router.patch("/{video_id}", response_model=VideoResponse)
async def edit_video(
    video_id: str,
    payload: VideoEditRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Edit existing video metadata (title/prompt)."""
    stmt = select(Video).where(Video.id == video_id, Video.user_id == current_user.id)
    result = await db.execute(stmt)
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if payload.title is not None:
        video.title = payload.title.strip() or None
    if payload.prompt is not None:
        video.user_prompt = payload.prompt.strip() or None

    await db.commit()
    await db.refresh(video)
    return _with_signed_thumbnail(video)

@router.delete("/{video_id}")
async def delete_video(
    video_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete video."""
    stmt = select(Video).where(Video.id == video_id, Video.user_id == current_user.id)
    result = await db.execute(stmt)
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    await db.delete(video)
    await db.commit()
    return {"status": "ok", "message": "Video deleted"}
