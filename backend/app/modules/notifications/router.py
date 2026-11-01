from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import AuthenticatedUser, get_current_user
from app.modules.requests.router import _NOTIFICATIONS_STORE, get_now_iso

router = APIRouter(prefix="", tags=["Notifications"])


@router.get("/notifications")
def list_notifications(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Return all notifications for the current user, newest first."""
    notifs = _NOTIFICATIONS_STORE.get(current_user.id, [])
    return sorted(notifs, key=lambda n: n["created_at"], reverse=True)


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Mark a single notification as read."""
    for notif in _NOTIFICATIONS_STORE.get(current_user.id, []):
        if notif["id"] == notification_id:
            notif["read_at"] = get_now_iso()
            return notif
    raise HTTPException(404, "Notification not found.")


@router.patch("/notifications/read-all")
def mark_all_notifications_read(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Mark all notifications for the user as read."""
    now = get_now_iso()
    count = 0
    for notif in _NOTIFICATIONS_STORE.get(current_user.id, []):
        if notif["read_at"] is None:
            notif["read_at"] = now
            count += 1
    return {"marked_read": count}
