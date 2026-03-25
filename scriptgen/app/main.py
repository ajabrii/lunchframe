import os
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from groq import Groq

# ─── Configuration ──────────────────────────────────────────
class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    DEFAULT_MODEL: str = "llama-3.3-70b-versatile"

    class Config:
        env_file = ".env"

settings = Settings()

app = FastAPI(title="Launchframe ScriptGen", version="0.1.0")
client = Groq(api_key=settings.GROQ_API_KEY)
logger = logging.getLogger(__name__)

# ─── Models ───────────────────────────────────────────────
class Scene(BaseModel):
    timestamp_start: float
    timestamp_end: float
    visual_description: str = Field(description="Detailed visual prompt for Remotion/Screenshots")
    overlay_text: str = Field(description="Punchy text to display on screen")
    voiceover_text: str = Field(description="The spoken script for this scene")

class VideoScript(BaseModel):
    title: str
    target_audience: str
    music_mood: str = Field(description="e.g. 'Energetic Tech', 'Minimal Cinematic'")
    scenes: List[Scene]

class ScriptRequest(BaseModel):
    product_name: str
    product_description: str
    brand_colors: List[str]
    user_prompt: Optional[str] = None


def build_fallback_script(request: ScriptRequest) -> VideoScript:
    title = f"Introducing {request.product_name}" if request.product_name else "Product Launch"
    description = request.product_description or "A modern product built for speed and clarity."

    return VideoScript(
        title=title,
        target_audience="Developers, startup founders, and product teams",
        music_mood="Minimal Cinematic",
        scenes=[
            Scene(
                timestamp_start=0.0,
                timestamp_end=6.0,
                visual_description="Fast animated logo reveal with subtle gradient lighting",
                overlay_text=request.product_name or "Your Product",
                voiceover_text=f"Meet {request.product_name}. Built for teams that ship fast."
            ),
            Scene(
                timestamp_start=6.0,
                timestamp_end=16.0,
                visual_description="Clean UI walkthrough showing the core workflow in 3 quick steps",
                overlay_text="From idea to launch",
                voiceover_text=f"{description[:180]}"
            ),
            Scene(
                timestamp_start=16.0,
                timestamp_end=28.0,
                visual_description="Before and after split-screen highlighting speed and output quality",
                overlay_text="Ship with confidence",
                voiceover_text="Create polished results in minutes, not days."
            ),
            Scene(
                timestamp_start=28.0,
                timestamp_end=36.0,
                visual_description="Strong final hero shot with product URL and CTA",
                overlay_text="Try it today",
                voiceover_text="Start now and turn your product into a launch-ready story."
            ),
        ]
    )

# ─── System Prompt ─────────────────────────────────────────
SYSTEM_PROMPT = """You are an elite product marketing scriptwriter for high-end tech launches (think Apple, Vercel, Linear).
Your goal is to transform technical product metadata into a high-converting, punchy, and cinematic video script.

RULES:
- Keep it PUNCHY. Sentences should be short and impactful.
- Direct the visual scenes based on the product description.
- The total video duration should be between 30-45 seconds.
- JSON format is MANDATORY.

Tone: Professional, Minimalist, Game-changing."""

# ─── Routes ───────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "scriptgen"}

@app.post("/generate-script", response_model=VideoScript)
async def generate_script(request: ScriptRequest):
    if not settings.GROQ_API_KEY:
        return build_fallback_script(request)

    try:
        completion = client.chat.completions.create(
            model=settings.DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Product: {request.product_name}\\nDescription: {request.product_description}\\nPrompt: {request.user_prompt or 'None'}"}
            ],
            response_format={"type": "json_object"}
        )

        script_json = json.loads(completion.choices[0].message.content)
        return VideoScript.model_validate(script_json)

    except Exception as e:
        logger.exception("Script generation failed, using fallback script")
        return build_fallback_script(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
