
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
# Copy and setup entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Command to run the application
CMD ["./entrypoint.sh"]

