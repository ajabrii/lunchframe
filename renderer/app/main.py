"""Launchframe — Renderer Service (stub)."""

from fastapi import FastAPI

app = FastAPI(title="Launchframe Renderer", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "renderer"}


@app.post("/render")
async def render():
    """Stub — will be implemented in Phase 3."""
    return {"error": "not_implemented", "message": "Renderer not implemented yet"}, 501
