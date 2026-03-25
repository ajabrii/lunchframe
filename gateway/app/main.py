"""Launchframe — API Gateway.

Central entry point. Handles auth, routes to downstream services,
and aggregates health checks.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routers import auth_router, projects_router, templates_router, videos_router

logger = logging.getLogger("lunchframe.gateway")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    logger.info("🚀 Launchframe Gateway starting up...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables created")
    yield
    logger.info("🛑 Launchframe Gateway shutting down...")
    await engine.dispose()


app = FastAPI(
    title="Launchframe Gateway",
    description="AI-powered product video generation platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router.router)
app.include_router(videos_router.router)
app.include_router(templates_router.router)
app.include_router(projects_router.router)


@app.get("/health")
async def health():
    """Gateway health check."""
    return {
        "status": "ok",
        "service": "gateway",
        "version": "0.1.0",
    }
