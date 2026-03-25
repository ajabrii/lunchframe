# Launchframe

> **Ship fast. Launch louder.** ⚡

AI-powered product video generation platform. Paste a URL to your tech product, write a prompt or pick a template, and get back a world-class demo/launch video.

## Quick Start

```bash
# 1. Copy environment variables
cp .env.local .env

# 2. Add your Groq API key to .env
# GROQ_API_KEY=gsk_your_key_here

# 2.1 Add Google OAuth client id (used by frontend + gateway)
# GOOGLE_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com

# 3. Start all services
docker compose up --build

# 4. Open the app
# Frontend: http://localhost
# API Docs: http://localhost/api/docs
# MinIO Console: http://localhost:9001
```

## Architecture

```
nginx (port 80) → frontend (React/Vite)
                → gateway (FastAPI :8000) → crawler (:8001)
                                          → scriptgen (:8002)
                                          → renderer (:8003)
                                          → tts (:8004)
                                          → worker (Celery)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + TypeScript |
| Backend | Python 3.12 + FastAPI |
| Task Queue | Celery 5 + Redis |
| Database | PostgreSQL 17 |
| Video Rendering | Remotion 4 + FFmpeg |
| TTS | Kokoro TTS |
| AI | Groq (dev) / Claude (prod) |
| Storage | MinIO (dev) / Cloudflare R2 (prod) |

## Services

- **gateway** — Auth, routing, validation
- **crawler** — Playwright web scraping
- **scriptgen** — AI video script generation
- **tts** — Text-to-speech via Kokoro
- **renderer** — Remotion + FFmpeg video rendering
- **worker** — Celery pipeline orchestrator

---

Built by [Iron](https://github.com/ajabri) 🔥
