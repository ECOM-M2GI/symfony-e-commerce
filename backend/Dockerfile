FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc=4:14.2.0-1 \
        curl=8.14.1-2 \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir uv==0.8.8

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install Python dependencies
RUN uv sync --frozen && uv add gunicorn gevent

# Copy project
COPY . .

# Expose port
EXPOSE 8000

# make migrations and migrate
RUN uv run python manage.py makemigrations

# Use proper Gunicorn configuration with increased timeout and multiple workers
CMD ["/bin/sh", "-c", "uv run python manage.py migrate && uv run gunicorn --config gunicorn.conf.py ebey.wsgi:application"]
