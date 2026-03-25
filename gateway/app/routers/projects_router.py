"""Launchframe — Projects Router (stub for Phase 1)."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/v1/projects", tags=["projects"])


@router.post("")
async def create_project(current_user: User = Depends(get_current_user)):
    """Stub — Create a new project."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet.",
    )


@router.get("")
async def list_projects(current_user: User = Depends(get_current_user)):
    """Stub — List user's projects."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet.",
    )
