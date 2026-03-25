"""Launchframe — Crawler Service (stub)."""

from fastapi import FastAPI

app = FastAPI(title="Launchframe Crawler", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "crawler"}


@app.post("/crawl")
async def crawl():
    """Stub — will be implemented in Phase 2."""
    return {"error": "not_implemented", "message": "Crawler not implemented yet"}, 501
