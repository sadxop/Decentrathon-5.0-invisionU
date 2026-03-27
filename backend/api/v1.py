from fastapi import APIRouter, HTTPException

from ..models.candidate import CandidateEntry, CandidateAnalysisResponse, BatchAnalysisResponse
from ..models.decision import DecisionPayload
from ..services.analysis_service import analyze_one, analyze_many
from ..services.candidate_store import store


router = APIRouter(prefix="/api/v1", tags=["v1"])


@router.post("/analyze", response_model=CandidateAnalysisResponse)
def analyze(candidate: CandidateEntry):
    return analyze_one(candidate)


@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
def analyze_batch(candidates: list[CandidateEntry]):
    return analyze_many(candidates)


@router.get("/candidates")
def list_candidates():
    return store.list_all()


@router.get("/candidates/{candidate_id}")
def get_candidate(candidate_id: str):
    record = store.get(candidate_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"candidate_id": candidate_id, **record}


@router.post("/candidates/{candidate_id}/decision")
def set_decision(candidate_id: str, payload: DecisionPayload):
    note = payload.admin_note.strip()
    if not note:
        raise HTTPException(status_code=400, detail="admin_note must not be empty")

    updated = store.update_decision(candidate_id, payload.decision, note)
    if not updated:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return {
        "status": "Decision saved by human",
        "candidate_id": candidate_id,
        "final_decision": payload.decision,
        "admin_note": note,
    }


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
def reset_db():
    deleted = store.delete_all()
    return {"status": "ok", "deleted": deleted}

