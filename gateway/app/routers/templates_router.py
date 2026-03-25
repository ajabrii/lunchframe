"""Launchframe — Templates Router (stub for Phase 1)."""

from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/v1/templates", tags=["templates"])


@router.get("")
async def list_templates(category: str | None = None, free_only: bool = False):
    """Stub — List available templates."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Templates not seeded yet. Coming in Phase 5.",
    )


@router.get("/{template_id}")
async def get_template(template_id: str):
    """Stub — Get template details."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet.",
    )
