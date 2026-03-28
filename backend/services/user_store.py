from __future__ import annotations

from typing import Optional

from sqlalchemy import select, insert

from ..db.database import engine, users_table


def create_user(name: str, email: str, hashed_password: str, role: str = "admin") -> dict:
    with engine.connect() as conn:
        result = conn.execute(
            insert(users_table).values(
                name=name,
                email=email,
                hashed_password=hashed_password,
                role=role,
            ).returning(users_table)
        )
        conn.commit()
        row = result.fetchone()
        return dict(row._mapping)


def get_user_by_email(email: str) -> Optional[dict]:
    with engine.connect() as conn:
        row = conn.execute(
            select(users_table).where(users_table.c.email == email)
        ).fetchone()
        return dict(row._mapping) if row else None


def get_user_by_id(user_id: int) -> Optional[dict]:
    with engine.connect() as conn:
        row = conn.execute(
            select(users_table).where(users_table.c.id == user_id)
        ).fetchone()
        return dict(row._mapping) if row else None


def email_exists(email: str) -> bool:
    return get_user_by_email(email) is not None
