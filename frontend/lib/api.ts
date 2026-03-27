import axios from "axios";

export interface CandidateEntry {
    full_name: string;
    city: string;
    essay: string;
    achievements: string;
    experience_years: number;
}

export interface ScoringResult {
    total_score: number;
    leadership_label: string;
    rationale: string;
}

export async function analyzeCandidate(data: CandidateEntry): Promise<ScoringResult> {
    const response = await axios.post<ScoringResult>("/api/analyze", data);
    return response.data;
}
