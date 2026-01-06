#!/bin/sh
set -e

echo "Applying database migrations..."
python manage.py migrate

echo "Starting Gunicorn..."
exec gunicorn main.wsgi:application --bind 0.0.0.0:8000
