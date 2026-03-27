from __future__ import annotations

import json
from typing import Any

from sqlalchemy import delete, insert, select, update

from ..db.database import candidates_table, engine, init_db


def _row_to_dict(row: Any) -> dict[str, Any]:
    return {
        "candidate_id": row.candidate_id,
        "full_name": row.full_name,
        "city": row.city,
        "ai_total_score": row.ai_total_score,
        "ai_label": row.ai_label,
        "baseline_score": row.baseline_score,
        "telegram_id": row.telegram_id,
        "final_decision": row.final_decision,
        "admin_note": row.admin_note,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        "candidate": json.loads(row.candidate_json or "{}"),
        "ai": json.loads(row.ai_json or "{}"),
    }


class CandidateStore:
    def __init__(self) -> None:
        init_db()

    def save(self, candidate_id: str, record: dict[str, Any]) -> None:
        candidate = record.get("candidate", {})
        ai = record.get("ai", {})
        values = {
            "candidate_id": candidate_id,
            "candidate_json": json.dumps(candidate, ensure_ascii=False),
            "baseline_score": int(record.get("baseline_score", 0)),
            "ai_json": json.dumps(ai, ensure_ascii=False),
            "full_name": candidate.get("full_name"),
            "city": candidate.get("city"),
            "experience_years": candidate.get("experience_years"),
            "ai_total_score": ai.get("total_score"),
            "ai_label": ai.get("leadership_label"),
            "telegram_id": candidate.get("telegram_id"),
            "final_decision": record.get("final_decision"),
            "admin_note": record.get("admin_note"),
        }
        with engine.begin() as conn:
            existing = conn.execute(
                select(candidates_table.c.candidate_id).where(
                    candidates_table.c.candidate_id == candidate_id
                )
            ).fetchone()
            if existing:
                conn.execute(
                    update(candidates_table)
                    .where(candidates_table.c.candidate_id == candidate_id)
                    .values(**{k: v for k, v in values.items() if k != "candidate_id"})
                )
            else:
                conn.execute(insert(candidates_table).values(**values))

    def get(self, candidate_id: str) -> dict[str, Any] | None:
        with engine.connect() as conn:
            row = conn.execute(
                select(candidates_table).where(
                    candidates_table.c.candidate_id == candidate_id
                )
            ).fetchone()
            if row is None:
                return None
            return _row_to_dict(row)

    def update_decision(self, candidate_id: str, decision: str, admin_note: str) -> bool:
        with engine.begin() as conn:
            result = conn.execute(
                update(candidates_table)
                .where(candidates_table.c.candidate_id == candidate_id)
                .values(final_decision=decision, admin_note=admin_note)
            )
            return result.rowcount > 0

    def list_all(self) -> list[dict[str, Any]]:
        with engine.connect() as conn:
            rows = conn.execute(
                select(candidates_table).order_by(
                    candidates_table.c.created_at.desc()
                )
            ).fetchall()
            return [_row_to_dict(r) for r in rows]

    def delete_all(self) -> int:
        with engine.begin() as conn:
            result = conn.execute(delete(candidates_table))
            return result.rowcount

    def shortlist(self, min_score: int, limit: int) -> dict[str, Any]:
        candidates = self.list_all()
        deduped: dict[tuple[str, str], dict[str, Any]] = {}
        for c in candidates:
            key = (
                str(c.get("full_name") or "").strip().lower(),
                str(c.get("city") or "").strip().lower(),
            )
            prev = deduped.get(key)
            ai_score = c.get("ai_total_score") or 0
            if prev is None or ai_score > (prev.get("ai_total_score") or 0):
                deduped[key] = c

        shortlisted = [c for c in deduped.values() if (c.get("ai_total_score") or 0) >= min_score]
        shortlisted.sort(key=lambda x: x.get("ai_total_score") or 0, reverse=True)
        return {"total": len(shortlisted), "items": shortlisted[:limit]}

    def metrics(self) -> dict[str, Any]:
        candidates = self.list_all()
        total = len(candidates)
        if total == 0:
            return {
                "total_candidates": 0,
                "avg_ai_score": 0,
                "avg_baseline_score": 0,
                "label_distribution": {},
                "final_decisions": {"approved": 0, "rejected": 0, "pending": 0},
            }

        ai_scores = [c.get("ai_total_score") or 0 for c in candidates]
        baseline_scores = [c.get("baseline_score") or 0 for c in candidates]

        label_distribution: dict[str, int] = {}
        for c in candidates:
            label = c.get("ai_label") or "Unknown"
            label_distribution[label] = label_distribution.get(label, 0) + 1

        approved = sum(1 for c in candidates if c.get("final_decision") == "Approved")
        rejected = sum(1 for c in candidates if c.get("final_decision") == "Rejected")
        pending = total - approved - rejected

        return {
            "total_candidates": total,
            "avg_ai_score": round(sum(ai_scores) / total, 2),
            "avg_baseline_score": round(sum(baseline_scores) / total, 2),
            "label_distribution": label_distribution,
            "final_decisions": {"approved": approved, "rejected": rejected, "pending": pending},
        }


store = CandidateStore()

