"""Launchframe — Templates Router."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Template
from app.schemas import TemplateListResponse, TemplateResponse

router = APIRouter(prefix="/v1/templates", tags=["templates"])


@router.get("", response_model=TemplateListResponse)
async def list_templates(
    category: str | None = None,
    free_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """List available templates with optional filters."""
    stmt = select(Template)

    if category:
        stmt = stmt.where(Template.category == category)

    if free_only:
        stmt = stmt.where(Template.is_premium.is_(False))

    stmt = stmt.order_by(Template.created_at.desc())
    result = await db.execute(stmt)
    templates = result.scalars().all()

    return TemplateListResponse(
        templates=[TemplateResponse.model_validate(t) for t in templates]
    )


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str, db: AsyncSession = Depends(get_db)):
    """Get template details."""
    try:
        parsed_id = uuid.UUID(template_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid template id",
        )

    stmt = select(Template).where(Template.id == parsed_id)
    result = await db.execute(stmt)
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )

    return TemplateResponse.model_validate(template)
