"""
Crash event logging endpoint.
MVP: stores in a simple SQLite database (upgrade to PostgreSQL when scaling).
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sqlite3
import os

router = APIRouter()

DB_PATH = os.getenv("DB_PATH", "aderos.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS crash_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL,
            longitude REAL,
            timestamp TEXT,
            user_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    return conn


class CrashEvent(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: str
    user_id: Optional[str] = None


@router.post("/crash-events")
def log_crash_event(event: CrashEvent):
    """Log a crash event from the mobile app."""
    conn = get_db()
    conn.execute(
        "INSERT INTO crash_events (latitude, longitude, timestamp, user_id) VALUES (?, ?, ?, ?)",
        (event.latitude, event.longitude, event.timestamp, event.user_id),
    )
    conn.commit()
    conn.close()
    return {"status": "logged", "message": "Crash event recorded"}


@router.get("/crash-events")
def list_crash_events(limit: int = 50):
    """List recent crash events (for your future city dashboard!)."""
    conn = get_db()
    rows = conn.execute(
        "SELECT id, latitude, longitude, timestamp, created_at FROM crash_events ORDER BY id DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return [
        {"id": r[0], "latitude": r[1], "longitude": r[2], "timestamp": r[3], "created_at": r[4]}
        for r in rows
    ]
