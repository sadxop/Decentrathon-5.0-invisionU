from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, List


#тут мы ждем от кандидата
class CandidateEntry(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    city: str = Field(min_length=1, max_length=120)
    essay: str = Field(min_length=1, max_length=8000)
    achievements: str = Field(min_length=1, max_length=4000)
    experience_years: int = Field(ge=0, le=50)

    @field_validator("full_name", "city", "essay", "achievements", mode="before")
    @classmethod
    def normalize_text_fields(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v


#тут отвечает ии
class ScoringResult(BaseModel):
    total_score: int
    leadership_label: str
    rationale: str  #обьяснение оценки
    verdict: Optional[str] = None


class CandidateAnalysisResponse(BaseModel):
    candidate_id: str
    baseline_score: int
    ai: ScoringResult
    final_decision: Optional[Literal["Approved", "Rejected"]] = None
    admin_note: Optional[str] = None


class BatchAnalysisResponse(BaseModel):
    total: int
    items: List[CandidateAnalysisResponse]
