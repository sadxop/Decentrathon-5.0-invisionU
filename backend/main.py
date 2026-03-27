from fastapi import FastAPI
from .models.candidate import CandidateEntry, ScoringResult
from .services.scoring import evaluate_candidate

app = FastAPI(title="inVisionU scoring system")

@app.get("/")
def read_root():
    return {"status": "Backend is online", "message": "Ready to score candidates"}


@app.post("/analyze", response_model=ScoringResult)
def analyze(candidate: CandidateEntry):
    result = evaluate_candidate(candidate)
    return result
