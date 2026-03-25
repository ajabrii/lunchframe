FROM python:3.12-slim

# Create a non-root user
RUN groupadd -r celery && useradd -r -g celery celery

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

# Set ownership
RUN chown -R celery:celery /app

# Switch to the non-root user
USER celery

# Default command is overridden in docker-compose.yml
CMD ["celery", "-A", "app.celery_app", "worker", "--loglevel=info", "--concurrency=4"]
