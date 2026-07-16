"""
ADEROS Backend — FastAPI server
Week 4 focus: user accounts, crash event logging, contact sync

Run locally:  uvicorn app.main:app --reload
Deploy:       Render.com (you already know this from your other projects)
API docs:     http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import crash_events, users

app = FastAPI(
    title="ADEROS API",
    description="Backend for ADEROS – Ride Safe crash detection app",
    version="0.1.0",
)

# Allow the mobile app to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crash_events.router, prefix="/api/v1", tags=["crash-events"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])


@app.get("/")
def health_check():
    return {"status": "ok", "service": "ADEROS API", "version": "0.1.0"}
