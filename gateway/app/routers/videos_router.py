"""Launchframe — Videos Router (stub for Phase 1)."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/v1/videos", tags=["videos"])


@router.post("/generate")
async def generate_video(current_user: User = Depends(get_current_user)):
    """Stub — Phase 2: Submit video generation job."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Video generation not implemented yet. Coming in Phase 2.",
    )


@router.get("/{video_id}")
async def get_video(video_id: str, current_user: User = Depends(get_current_user)):
    """Stub — Get video details."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet.",
    )


@router.get("/{video_id}/status")
async def video_status(video_id: str, current_user: User = Depends(get_current_user)):
    """Stub — SSE status stream. Phase 2."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="SSE streaming not implemented yet.",
    )


@router.get("")
async def list_videos(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
):
    """Stub — List user's videos."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet.",
    )


@router.delete("/{video_id}")
async def delete_video(video_id: str, current_user: User = Depends(get_current_user)):
    """Stub — Delete video."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet.",
    )
