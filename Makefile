# ═══════════════════════════════════════════════════════════
#  Launchframe — Makefile
#  Ship fast. Launch louder. ⚡
# ═══════════════════════════════════════════════════════════

.PHONY: dev build up down restart logs ps clean frontend gateway

# ─── Quick Start ──────────────────────────────────────────

## Start all services in dev mode (build + up)
dev:
	@echo "🚀 Launching Launchframe..."
	@cp -n .env.local .env 2>/dev/null || true
	docker compose up --build

## Same as dev but detached (background)
dev-d:
	@echo "🚀 Launching Launchframe (detached)..."
	@cp -n .env.local .env 2>/dev/null || true
	docker compose up --build -d

## Build all images without starting
build:
	docker compose build

## Start services (no rebuild)
up:
	docker compose up -d

## Stop all services
down:
	docker compose down

## Restart all services
restart:
	docker compose restart

# ─── Logs ─────────────────────────────────────────────────

## Show all logs (follow)
logs:
	docker compose logs -f

## Show gateway logs
logs-gateway:
	docker compose logs -f gateway

## Show worker logs
logs-worker:
	docker compose logs -f worker

## Show frontend logs
logs-frontend:
	docker compose logs -f frontend

# ─── Status ───────────────────────────────────────────────

## Show running containers
ps:
	docker compose ps

## Health check all services
health:
	@echo "🏥 Health Checks:"
	@echo "───────────────────────────────"
	@curl -sf http://localhost/api/health 2>/dev/null && echo "" || echo "❌ Gateway: DOWN"
	@curl -sf http://localhost:8001/health 2>/dev/null && echo "" || echo "⏳ Crawler: not exposed"
	@curl -sf http://localhost:8002/health 2>/dev/null && echo "" || echo "⏳ ScriptGen: not exposed"
	@echo "───────────────────────────────"

# ─── Database ─────────────────────────────────────────────

## Open psql shell
db-shell:
	docker compose exec postgres psql -U lunchframe -d lunchframe

## Show DB tables
db-tables:
	docker compose exec postgres psql -U lunchframe -d lunchframe -c "\dt"

# ─── Individual Services ──────────────────────────────────

## Run only frontend (for UI dev)
frontend:
	cd frontend && npm install && npm run dev

## Run only gateway (local, no Docker)
gateway:
	cd gateway && uvicorn app.main:app --reload --port 8000

# ─── Cleanup ──────────────────────────────────────────────

## Stop and remove everything (containers + volumes)
clean:
	@echo "🧹 Cleaning up..."
	docker compose down -v --remove-orphans
	@echo "✅ Done"

## Nuclear option — remove images too
nuke:
	@echo "💣 Removing everything..."
	docker compose down -v --remove-orphans --rmi all
	@echo "✅ Nuked"

# ─── Help ─────────────────────────────────────────────────

## Show this help
help:
	@echo ""
	@echo "  Launchframe — Available Commands"
	@echo "  ════════════════════════════════════"
	@echo ""
	@echo "  make dev          Start all services (build + up)"
	@echo "  make dev-d        Start detached (background)"
	@echo "  make down         Stop all services"
	@echo "  make logs         Follow all logs"
	@echo "  make ps           Show running containers"
	@echo "  make health       Health check services"
	@echo "  make db-shell     Open PostgreSQL shell"
	@echo "  make frontend     Run frontend locally"
	@echo "  make clean        Stop + remove volumes"
	@echo "  make nuke         Remove everything"
	@echo ""
