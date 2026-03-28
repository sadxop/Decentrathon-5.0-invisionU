import asyncio
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel

from ..models.candidate import CandidateEntry, CandidateAnalysisResponse, BatchAnalysisResponse
from ..models.decision import DecisionPayload
from ..services.analysis_service import analyze_one, analyze_many
from ..services.auth_service import get_current_user
from ..services.candidate_store import store
from ..services.notification_store import create_notification
from .websocket import manager


router = APIRouter(prefix="/api/v1", tags=["v1"])


class CandidateResponse(BaseModel):
    id: str
    full_name: str
    city: str
    essay: str
    achievements: str
    experience_years: int
    total_score: int
    leadership_label: str
    rationale: str
    status: str
    created_at: str


class StatusPatch(BaseModel):
    status: str


def _decision_to_status(final_decision: Optional[str]) -> str:
    if not final_decision:
        return "pending"
    return {"Approved": "approved", "Interview": "interview"}.get(final_decision, "pending")


def _to_response(record: dict[str, Any]) -> CandidateResponse:
    c = record.get("candidate") or {}
    ai = record.get("ai") or {}
    return CandidateResponse(
        id=record.get("candidate_id", ""),
        full_name=record.get("full_name") or c.get("full_name", ""),
        city=record.get("city") or c.get("city", ""),
        essay=c.get("essay", ""),
        achievements=c.get("achievements", ""),
        experience_years=c.get("experience_years") or record.get("experience_years") or 0,
        total_score=record.get("ai_total_score") or ai.get("total_score") or 0,
        leadership_label=record.get("ai_label") or ai.get("leadership_label") or "",
        rationale=ai.get("rationale") or "",
        status=_decision_to_status(record.get("final_decision")),
        created_at=record.get("created_at") or datetime.utcnow().isoformat(),
    )


def _make_notification(candidate_id: str, full_name: str, score: int) -> None:
    if score >= 75:
        create_notification(type="top", title="Новый ТОП ТАЛАНТ",
                            body=f"{full_name} получил оценку {score}", candidate_id=candidate_id)
    elif score < 50:
        create_notification(type="risk", title="Риск профиль",
                            body=f"{full_name} получил оценку {score}. Требуется проверка.",
                            candidate_id=candidate_id)
    else:
        create_notification(type="new", title="Новый кандидат обработан",
                            body=f"{full_name} успешно проанализирован. Оценка: {score}.",
                            candidate_id=candidate_id)


@router.post("/analyze", response_model=CandidateAnalysisResponse)
async def analyze(candidate: CandidateEntry, background_tasks: BackgroundTasks):
    result = await asyncio.to_thread(analyze_one, candidate)
    score = result.ai.total_score
    background_tasks.add_task(manager.broadcast, {
        "type": "new_candidate",
        "candidate_id": result.candidate_id,
        "full_name": candidate.full_name,
        "city": candidate.city,
        "ai_total_score": score,
        "ai_label": result.ai.leadership_label,
    })
    background_tasks.add_task(_make_notification, result.candidate_id, candidate.full_name, score)
    return result


@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
def analyze_batch(candidates: list[CandidateEntry]):
    return analyze_many(candidates)


@router.get("/candidates", response_model=list[CandidateResponse])
def list_candidates():
    return [_to_response(r) for r in store.list_all()]


@router.get("/candidates/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: str):
    record = store.get(candidate_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return _to_response({"candidate_id": candidate_id, **record})


@router.patch("/candidates/{candidate_id}/status")
def patch_status(candidate_id: str, body: StatusPatch,
                 current: dict = Depends(get_current_user)):
    if body.status not in ("pending", "approved", "interview"):
        raise HTTPException(status_code=400, detail="status must be pending | approved | interview")
    ok = store.update_status(candidate_id, body.status)
    if not ok:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"id": candidate_id, "status": body.status}


@router.delete("/candidates/{candidate_id}")
def delete_candidate(candidate_id: str, current: dict = Depends(get_current_user)):
    ok = store.delete_one(candidate_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"id": candidate_id, "deleted": True}


@router.post("/candidates/{candidate_id}/decision")
def set_decision(candidate_id: str, payload: DecisionPayload):
    note = (payload.admin_note or "").strip()
    updated = store.update_decision(candidate_id, payload.decision, note)
    if not updated:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"status": "Decision saved by human", "candidate_id": candidate_id,
            "final_decision": payload.decision, "admin_note": note}


@router.get("/shortlist")
def shortlist(min_score: int = 60, limit: int = 20):
    if min_score < 0 or min_score > 100:
        raise HTTPException(status_code=400, detail="min_score must be between 0 and 100")
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 1000")
    return store.shortlist(min_score=min_score, limit=limit)


@router.get("/metrics")
def metrics():
    return store.metrics()


@router.post("/admin/reset-db")
def reset_db(current: dict = Depends(get_current_user)):
    deleted = store.delete_all()
    return {"status": "ok", "deleted": deleted}

