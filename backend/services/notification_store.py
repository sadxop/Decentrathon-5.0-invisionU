from __future__ import annotations

from typing import Optional

from sqlalchemy import insert, select, update

from ..db.database import engine, notifications_table


def create_notification(
    type: str,
    title: str,
    body: str,
    candidate_id: Optional[str] = None,
    user_id: Optional[int] = None,
) -> dict:
    with engine.connect() as conn:
        result = conn.execute(
            insert(notifications_table).values(
                type=type,
                title=title,
                body=body,
                candidate_id=candidate_id,
                user_id=user_id,
                read=False,
            ).returning(notifications_table)
        )
        conn.commit()
        row = result.fetchone()
        return dict(row._mapping)


def get_notifications(user_id: Optional[int] = None) -> list[dict]:
    with engine.connect() as conn:
        stmt = select(notifications_table).order_by(
            notifications_table.c.created_at.desc()
        )
        rows = conn.execute(stmt).fetchall()
        return [dict(r._mapping) for r in rows]


def mark_read(notification_id: int) -> bool:
    with engine.connect() as conn:
        result = conn.execute(
            update(notifications_table)
            .where(notifications_table.c.id == notification_id)
            .values(read=True)
        )
        conn.commit()
        return result.rowcount > 0


def mark_all_read(user_id: Optional[int] = None) -> int:
    with engine.connect() as conn:
        result = conn.execute(
            update(notifications_table).values(read=True)
        )
        conn.commit()
        return result.rowcount
