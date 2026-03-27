from __future__ import annotations

import os

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    create_engine,
    func,
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
    Column("telegram_id", Integer),
    Column("final_decision", String(32)),
    Column("admin_note", Text),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now()),
)


def init_db() -> None:
    metadata.create_all(engine)
