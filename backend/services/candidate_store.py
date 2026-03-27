from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from threading import Lock
from typing import Any


class CandidateStore:
    def __init__(self) -> None:
        self._lock = Lock()
        db_dir = Path(__file__).resolve().parents[1] / "db"
        db_dir.mkdir(parents=True, exist_ok=True)
        self._db_path = db_dir / "candidates.sqlite3"
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        # PRAGMA tuning can fail on some Docker/host filesystems.
        # DB must still work even when these optimizations are unavailable.
        try:
            conn.execute("PRAGMA journal_mode = WAL")
        except sqlite3.OperationalError:
            try:
                conn.execute("PRAGMA journal_mode = DELETE")
            except sqlite3.OperationalError:
                pass
        try:
            conn.execute("PRAGMA synchronous = NORMAL")
        except sqlite3.OperationalError:
            pass
        return conn

    def _init_db(self) -> None:
        with self._get_conn() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS candidates (
                    candidate_id TEXT PRIMARY KEY,
                    candidate_json TEXT NOT NULL,
                    baseline_score INTEGER NOT NULL,
                    ai_json TEXT NOT NULL,
                    full_name TEXT,
                    city TEXT,
                    experience_years INTEGER,
                    ai_total_score INTEGER,
                    ai_label TEXT,
                    final_decision TEXT,
                    admin_note TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
                """
            )
            columns = {
                row["name"]
                for row in conn.execute("PRAGMA table_info(candidates)").fetchall()
            }
            if "created_at" not in columns:
                conn.execute("ALTER TABLE candidates ADD COLUMN created_at TEXT")
            if "updated_at" not in columns:
                conn.execute("ALTER TABLE candidates ADD COLUMN updated_at TEXT")
            if "full_name" not in columns:
                conn.execute("ALTER TABLE candidates ADD COLUMN full_name TEXT")
            if "city" not in columns:
                conn.execute("ALTER TABLE candidates ADD COLUMN city TEXT")
            if "experience_years" not in columns:
                conn.execute("ALTER TABLE candidates ADD COLUMN experience_years INTEGER")
            if "ai_total_score" not in columns:
                conn.execute("ALTER TABLE candidates ADD COLUMN ai_total_score INTEGER")
            if "ai_label" not in columns:
                conn.execute("ALTER TABLE candidates ADD COLUMN ai_label TEXT")
            conn.execute(
                """
                UPDATE candidates
                SET created_at = COALESCE(created_at, datetime('now')),
                    updated_at = COALESCE(updated_at, datetime('now'))
                """
            )
            rows = conn.execute(
                "SELECT candidate_id, candidate_json, ai_json FROM candidates"
            ).fetchall()
            for row in rows:
                try:
                    candidate = json.loads(row["candidate_json"] or "{}")
                except Exception:
                    candidate = {}
                try:
                    ai = json.loads(row["ai_json"] or "{}")
                except Exception:
                    ai = {}
                conn.execute(
                    """
                    UPDATE candidates
                    SET full_name = COALESCE(full_name, ?),
                        city = COALESCE(city, ?),
                        experience_years = COALESCE(experience_years, ?),
                        ai_total_score = COALESCE(ai_total_score, ?),
                        ai_label = COALESCE(ai_label, ?)
                    WHERE candidate_id = ?
                    """,
                    (
                        candidate.get("full_name"),
                        candidate.get("city"),
                        candidate.get("experience_years"),
                        ai.get("total_score"),
                        ai.get("leadership_label"),
                        row["candidate_id"],
                    ),
                )
            conn.commit()

    def save(self, candidate_id: str, record: dict[str, Any]) -> None:
        with self._lock:
            candidate = record.get("candidate", {})
            ai = record.get("ai", {})
            with self._get_conn() as conn:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO candidates
                    (candidate_id, candidate_json, baseline_score, ai_json, full_name, city, experience_years, ai_total_score, ai_label, final_decision, admin_note, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                    """,
                    (
                        candidate_id,
                        json.dumps(candidate, ensure_ascii=False),
                        int(record.get("baseline_score", 0)),
                        json.dumps(ai, ensure_ascii=False),
                        candidate.get("full_name"),
                        candidate.get("city"),
                        candidate.get("experience_years"),
                        ai.get("total_score"),
                        ai.get("leadership_label"),
                        record.get("final_decision"),
                        record.get("admin_note"),
                    ),
                )
                conn.commit()

    def get(self, candidate_id: str) -> dict[str, Any] | None:
        with self._lock:
            with self._get_conn() as conn:
                row = conn.execute(
                    "SELECT * FROM candidates WHERE candidate_id = ?",
                    (candidate_id,),
                ).fetchone()
                if row is None:
                    return None
                return {
                    "candidate": json.loads(row["candidate_json"]),
                    "baseline_score": row["baseline_score"],
                    "ai": json.loads(row["ai_json"]),
                    "final_decision": row["final_decision"],
                    "admin_note": row["admin_note"],
                }

    def update_decision(self, candidate_id: str, decision: str, admin_note: str) -> bool:
        with self._lock:
            with self._get_conn() as conn:
                cur = conn.execute(
                    """
                    UPDATE candidates
                    SET final_decision = ?, admin_note = ?, updated_at = datetime('now')
                    WHERE candidate_id = ?
                    """,
                    (decision, admin_note, candidate_id),
                )
                conn.commit()
            if cur.rowcount == 0:
                return False
            return True

    def list_all(self) -> list[dict[str, Any]]:
        with self._lock:
            with self._get_conn() as conn:
                rows = conn.execute("SELECT * FROM candidates ORDER BY datetime(updated_at) DESC").fetchall()
                return [
                    {
                        "candidate_id": row["candidate_id"],
                        "candidate": json.loads(row["candidate_json"]),
                        "baseline_score": row["baseline_score"],
                        "ai": json.loads(row["ai_json"]),
                        "final_decision": row["final_decision"],
                        "admin_note": row["admin_note"],
                    }
                    for row in rows
                ]

    def delete_all(self) -> int:
        with self._lock:
            with self._get_conn() as conn:
                cur = conn.execute("DELETE FROM candidates")
                conn.commit()
                return cur.rowcount

    def shortlist(self, min_score: int, limit: int) -> dict[str, Any]:
        candidates = self.list_all()

        # Deduplicate by candidate profile and keep best score.
        deduped: dict[tuple[str, str], dict[str, Any]] = {}
        for c in candidates:
            profile = c.get("candidate", {})
            key = (
                str(profile.get("full_name", "")).strip().lower(),
                str(profile.get("city", "")).strip().lower(),
            )
            prev = deduped.get(key)
            if prev is None or c.get("ai", {}).get("total_score", 0) > prev.get("ai", {}).get("total_score", 0):
                deduped[key] = c

        shortlisted = [c for c in deduped.values() if c.get("ai", {}).get("total_score", 0) >= min_score]
        shortlisted.sort(key=lambda x: x.get("ai", {}).get("total_score", 0), reverse=True)
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

        ai_scores = [c.get("ai", {}).get("total_score", 0) for c in candidates]
        baseline_scores = [c.get("baseline_score", 0) for c in candidates]

        label_distribution: dict[str, int] = {}
        for c in candidates:
            label = c.get("ai", {}).get("leadership_label", "Unknown")
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

