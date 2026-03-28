from fastapi import APIRouter, Depends, HTTPException

from ..models.notification import NotificationOut
from ..services.auth_service import get_current_user
from ..services.notification_store import get_notifications, mark_read, mark_all_read

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(current: dict = Depends(get_current_user)):
    return get_notifications()


@router.patch("/{notification_id}/read", response_model=dict)
def read_one(notification_id: int, current: dict = Depends(get_current_user)):
    ok = mark_read(notification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"id": notification_id, "read": True}


@router.patch("/read-all", response_model=dict)
def read_all(current: dict = Depends(get_current_user)):
    count = mark_all_read()
    return {"updated": count}
