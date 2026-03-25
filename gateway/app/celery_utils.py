"""Launchframe — Celery Utilities for the Gateway."""

from celery import Celery
from app.config import settings

celery_app = Celery(
    "lunchframe",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)
