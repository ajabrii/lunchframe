"""Launchframe — Pydantic Schemas (request/response models)."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ─── Auth ──────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str = Field(..., max_length=255)
    name: str | None = Field(None, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str | None
    plan: str
    videos_used: int
    videos_limit: int
    watermark: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Videos ────────────────────────────────────────────────
class VideoGenerateRequest(BaseModel):
    url: str
    prompt: str
    template_id: uuid.UUID
    target_duration: int = Field(30, ge=15, le=60)
    project_id: uuid.UUID | None = None
    brand_colors: dict | None = None


class VideoResponse(BaseModel):
    id: uuid.UUID
    title: str | None
    source_url: str | None
    status: str
    video_url: str | None
    thumbnail_url: str | None
    duration_seconds: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class VideoGenerateResponse(BaseModel):
    video_id: uuid.UUID
    job_id: str
    status: str = "pending"


class VideoEditRequest(BaseModel):
    title: str | None = Field(None, max_length=200)
    prompt: str | None = None


class VideoListResponse(BaseModel):
    videos: list[VideoResponse]
    total: int
    page: int


# ─── Templates ─────────────────────────────────────────────
class TemplateResponse(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    category: str | None
    description: str | None
    preview_url: str | None
    is_premium: bool

    model_config = {"from_attributes": True}


class TemplateListResponse(BaseModel):
    templates: list[TemplateResponse]


# ─── Projects ──────────────────────────────────────────────
class ProjectCreateRequest(BaseModel):
    name: str = Field(..., max_length=150)
    url: str | None = None
    description: str | None = None
    brand_colors: dict | None = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    url: str | None
    description: str | None
    brand_colors: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]


# ─── Health ────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
