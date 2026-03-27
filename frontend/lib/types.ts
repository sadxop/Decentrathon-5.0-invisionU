export interface Candidate {
    id: string;
    full_name: string;
    city: string;
    essay: string;
    achievements: string;
    experience_years: number;
    total_score: number;
    leadership_label: string;
    rationale: string;
    status: "pending" | "approved" | "interview";
    created_at: string;
}
