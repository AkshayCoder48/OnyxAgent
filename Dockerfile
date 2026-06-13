FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy optional requirements
COPY requirements-optional.txt .
RUN pip install --no-cache-dir -r requirements-optional.txt || true

# Copy the entire project
COPY . .

# Create data directory
RUN mkdir -p /home/agent/onyx

# Default config with 0.0.0.0 binding for HF Spaces
ENV ONYXAGENT_PREFIX=/app
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=7860

# HF Spaces uses port 7860
EXPOSE 7860

# Set the entrypoint
CMD ["python", "app.py"]
