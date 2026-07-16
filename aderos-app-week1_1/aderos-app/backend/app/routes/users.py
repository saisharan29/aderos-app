"""
User accounts — minimal MVP version.
Week 4: add real auth (JWT). For now, simple device-ID registration.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# In-memory store for MVP — replace with DB in Week 4
_users = {}


class UserRegistration(BaseModel):
    device_id: str
    name: Optional[str] = None


@router.post("/users/register")
def register_user(user: UserRegistration):
    """Register a device. Returns a user_id for crash event logging."""
    _users[user.device_id] = {"name": user.name}
    return {"user_id": user.device_id, "status": "registered"}


@router.get("/users/count")
def user_count():
    """Your traction metric! Show this number to incubators."""
    return {"total_users": len(_users)}
