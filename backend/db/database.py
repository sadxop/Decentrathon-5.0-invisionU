from __future__ import annotations

import os

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    create_engine,
    func,
    text,
)
from sqlalchemy.pool import QueuePool

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://invisionu:invisionu_secret@localhost:5432/invisionu",
)

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False,
)

metadata = MetaData()

candidates_table = Table(
    "candidates",
    metadata,
    Column("candidate_id", String, primary_key=True),
    Column("candidate_json", Text, nullable=False),
    Column("baseline_score", Integer, nullable=False, default=0),
    Column("ai_json", Text, nullable=False),
    Column("full_name", String(120)),
    Column("city", String(120)),
    Column("experience_years", Integer),
    Column("ai_total_score", Integer),
    Column("ai_label", String(64)),
    Column("telegram_id", BigInteger),
    Column("final_decision", String(32)),
    Column("admin_note", Text),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now()),
)


users_table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(120), nullable=False),
    Column("email", String(120), nullable=False, unique=True),
    Column("hashed_password", String(256), nullable=False),
    Column("role", String(32), nullable=False, server_default=text("'admin'")),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
)

notifications_table = Table(
    "notifications",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, nullable=True),
    Column("type", String(32), nullable=False),
    Column("title", String(256), nullable=False),
    Column("body", Text, nullable=False),
    Column("read", Boolean, nullable=False, default=False, server_default=text("false")),
    Column("candidate_id", String(36), nullable=True),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
)


def _migrate_candidates() -> None:
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE candidates ADD COLUMN user_id INTEGER"))
            conn.commit()
        except Exception:
            conn.rollback()


def init_db() -> None:
    metadata.create_all(engine)
    _migrate_candidates()
