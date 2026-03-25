# Gateway Node Migration (Express)

This folder is a migration scaffold for replacing the Python gateway with Node.js + Express.

## Goals
- Keep API contract identical: `/v1/auth`, `/v1/videos`, `/v1/templates`, `/v1/projects`
- Keep JWT shape compatible with frontend
- Keep SSE endpoint contract for processing status
- Keep DB schema unchanged

## Status
- Bootstrapped server with security middleware and health route
- Endpoint migration pending

## Run
1. `npm install`
2. `npm run dev`
3. open `http://localhost:8080/health`
