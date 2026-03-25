FROM python:3.12-slim

# Install Node.js (for Remotion)
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Chromium and dependencies for Remotion/Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Remotion project files (caching layer)
COPY package.json .
RUN npm install

# Copy application and source code
COPY src/ ./src/
COPY app/ ./app/

# Environment variable for Remotion to use the installed Chromium
ENV CHROME_PATH=/usr/bin/chromium

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]
