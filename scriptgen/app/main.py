"""Launchframe — ScriptGen Service (stub)."""

from fastapi import FastAPI

app = FastAPI(title="Launchframe ScriptGen", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "scriptgen"}


@app.post("/generate-script")
async def generate_script():
    """Stub — will be implemented in Phase 2."""
    return {"error": "not_implemented", "message": "ScriptGen not implemented yet"}, 501
