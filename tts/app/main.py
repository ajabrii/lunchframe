"""Launchframe — TTS Service (stub)."""

from fastapi import FastAPI

app = FastAPI(title="Launchframe TTS", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "tts"}


@app.post("/synthesize")
async def synthesize():
    """Stub — will be implemented in Phase 2."""
    return {"error": "not_implemented", "message": "TTS not implemented yet"}, 501
