FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including Chromium requirements for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    # Chromium / Playwright system dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    libwayland-client0 \
    # Fonts for proper page rendering
    fonts-noto-color-emoji \
    fonts-dejavu-core \
    # Screenshot / image processing support
    libpng16-16 \
    libjpeg62-turbo \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy optional requirements
COPY requirements-optional.txt .
RUN pip install --no-cache-dir -r requirements-optional.txt || true

# Install Playwright and Chromium browser (for the browser tool)
RUN pip install --no-cache-dir playwright && \
    playwright install chromium && \
    playwright install-deps chromium || true

# Copy the entire project
COPY . .

# Create data directories - /data is the persistent volume on HF Spaces
RUN mkdir -p /data/onyx /home/agent/onyx

# Copy the HF Spaces entrypoint
COPY hf-entrypoint.sh /hf-entrypoint.sh
RUN chmod +x /hf-entrypoint.sh

# Default config with 0.0.0.0 binding for HF Spaces
ENV ONYXAGENT_PREFIX=/app
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=7860
# Persist workspace to /data on HF Spaces (overrides config.json agent_workspace)
ENV AGENT_WORKSPACE=/data/onyx

# HF Spaces uses port 7860
EXPOSE 7860

# Health check for HF Spaces
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Set the entrypoint to our persistence-aware script
ENTRYPOINT ["/hf-entrypoint.sh"]
