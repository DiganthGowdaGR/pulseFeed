# ─── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend configuration and package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code and compile
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Build Python Backend & Serve Application ────────────────────────
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if required (clean up after install to save space)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY pulsefeed/requirements.txt ./pulsefeed/requirements.txt
RUN pip install --no-cache-dir -r pulsefeed/requirements.txt

# Copy backend application source
COPY backend/ ./backend
COPY pulsefeed/ ./pulsefeed
COPY app.py ./app.py

# Copy frontend build output from stage 1 into the backend serve path
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (default FastAPI/Uvicorn port)
EXPOSE 8000

# Run FastAPI backend with Uvicorn
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
