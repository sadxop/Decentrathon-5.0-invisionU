from re import S
from pydantic import BaseModel
from typing import Optional


#тут мы ждем от кандидата
class CandidateEntry(BaseModel):
    full_name: str
    city: str
    essay: str
    achievements: str
    experience_years: int


#тут отвечает ии
class ScoringResult(BaseModel):
    total_score: int
    leadership_label: str
    rationale: str  #обьяснение оценки
