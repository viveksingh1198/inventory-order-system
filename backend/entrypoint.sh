#!/bin/sh
set -e

echo "Waiting for database..."
until python -c "
import sys
from sqlalchemy import create_engine, text
from app.config import settings
engine = create_engine(settings.DATABASE_URL)
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
" 2>/dev/null; do
  sleep 2
done

echo "Running migrations..."
alembic upgrade head

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
