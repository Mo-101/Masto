FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && apt-get clean

# Copy application code
COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose port
EXPOSE 8080

# Run the sovereign orchestrator
CMD ["python", "main.py"]
