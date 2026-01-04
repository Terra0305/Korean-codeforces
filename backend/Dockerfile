
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    openssh-server \
    && rm -rf /var/lib/apt/lists/*

# Configure SSH for Azure App Service
RUN echo "root:Docker!" | chpasswd 
COPY sshd_config /etc/ssh/

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy project files
COPY . .

# Expose port (8000 for App, 2222 for SSH)
EXPOSE 8000 2222

# Command to run the application
# Start SSH service before Gunicorn
CMD service ssh start && python manage.py migrate && gunicorn main.wsgi:application --bind 0.0.0.0:8000
