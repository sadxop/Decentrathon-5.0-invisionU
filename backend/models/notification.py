from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    body: str
    read: bool
    candidate_id: Optional[str] = None
    created_at: datetime
