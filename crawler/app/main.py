import os
import asyncio
import uuid
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from pydantic_settings import BaseSettings
from playwright.async_api import async_playwright
import aioboto3
from botocore.config import Config
from botocore.exceptions import ClientError

# ─── Configuration ──────────────────────────────────────────
class Settings(BaseSettings):
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "launchframe"
    USE_SSL: bool = False

    class Config:
        env_file = ".env"

settings = Settings()

app = FastAPI(title="Launchframe Crawler", version="0.1.0")

# ─── Models ───────────────────────────────────────────────
class CrawlRequest(BaseModel):
    url: str
    project_id: str

class CrawlResponse(BaseModel):
    title: str
    description: str
    screenshot_url: str
    brand_colors: list[str]
    metadata: dict

# ─── S3 Helper ────────────────────────────────────────────
async def upload_to_s3(file_data: bytes, key: str, content_type: str = "image/png"):
    session = aioboto3.Session()
    async with session.client(
        's3',
        endpoint_url=f"{"https" if settings.USE_SSL else "http"}://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version='s3v4')
    ) as s3:
        try:
            await s3.head_bucket(Bucket=settings.MINIO_BUCKET)
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code", "")
            if error_code in {"404", "NoSuchBucket", "NotFound"}:
                await s3.create_bucket(Bucket=settings.MINIO_BUCKET)
            else:
                raise
        await s3.put_object(
            Bucket=settings.MINIO_BUCKET,
            Key=key,
            Body=file_data,
            ContentType=content_type
        )
    return f"{settings.MINIO_BUCKET}/{key}"

# ─── Routes ───────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "crawler"}

@app.post("/crawl", response_model=CrawlResponse)
async def crawl(request: CrawlRequest):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        page = await context.new_page()

        try:
            await page.goto(request.url, wait_until="networkidle", timeout=30000)

            # 1. Extract Metadata
            title = await page.title()
            description = await page.evaluate("""() => {
                const meta = document.querySelector("meta[name='description']");
                return meta?.content ?? "";
            }""")

            # 2. Extract Brand Colors (Dominant colors from first few h1/h2 elements)
            brand_colors = await page.evaluate("""() => {
                const colors = new Set();
                const elements = document.querySelectorAll('h1, h2, button, .primary-button');
                for (let el of elements) {
                    const style = window.getComputedStyle(el);
                    const color = style.color || style.backgroundColor;
                    if (color && !color.includes('rgba(0, 0, 0, 0)')) {
                        colors.add(color);
                        if (colors.size >= 3) break;
                    }
                }
                return Array.from(colors);
            }""")

            # 3. Capture Screenshot
            screenshot_bytes = await page.screenshot(full_page=False)
            screenshot_key = f"projects/{request.project_id}/screenshots/{uuid.uuid4()}.png"
            screenshot_url = await upload_to_s3(screenshot_bytes, screenshot_key)

            return CrawlResponse(
                title=title,
                description=description,
                screenshot_url=screenshot_url,
                brand_colors=brand_colors or ["#000000", "#FFFFFF"],
                metadata={
                    "url": request.url,
                    "engine": "playwright"
                }
            )

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            await browser.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
