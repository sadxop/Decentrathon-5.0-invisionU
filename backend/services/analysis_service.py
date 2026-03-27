from uuid import uuid4

from ..models.candidate import CandidateEntry, CandidateAnalysisResponse, BatchAnalysisResponse, ScoringResult
from .candidate_store import store
from .scoring import evaluate_candidate


def get_baseline_score(candidate: CandidateEntry) -> int:
    base = (candidate.experience_years * 5) + (len(candidate.achievements.split()) * 2)
    return min(base, 100)


def analyze_one(candidate: CandidateEntry) -> CandidateAnalysisResponse:
    candidate_id = str(uuid4())
    baseline_score = get_baseline_score(candidate)
    ai_raw = evaluate_candidate(candidate)
    ai = ScoringResult.model_validate(ai_raw)

    store.save(
        candidate_id,
        {
            "candidate": candidate.model_dump(),
            "baseline_score": baseline_score,
            "ai": ai.model_dump(),
            "final_decision": None,
            "admin_note": None,
        },
    )

    return CandidateAnalysisResponse(
        candidate_id=candidate_id,
        baseline_score=baseline_score,
        ai=ai,
    )


def analyze_many(candidates: list[CandidateEntry]) -> BatchAnalysisResponse:
    items = [analyze_one(candidate) for candidate in candidates]
    return BatchAnalysisResponse(total=len(items), items=items)

