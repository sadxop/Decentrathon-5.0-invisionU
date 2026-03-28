import axios from "axios";
import { Candidate } from "./types";

export interface CandidateEntry {
    full_name: string;
    city: string;
    essay: string;
    achievements: string;
    experience_years: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCandidate(raw: any): Candidate {
    const c = raw.candidate || {};
    const ai = raw.ai || {};
    const status: Candidate["status"] =
        raw.status === "approved" ? "approved" :
        raw.status === "interview" ? "interview" :
        (raw.final_decision || "").toLowerCase() === "approved" ? "approved" :
        (raw.final_decision || "").toLowerCase() === "interview" ? "interview" :
        "pending";
    return {
        id: raw.id || raw.candidate_id,
        full_name: raw.full_name || c.full_name || "",
        city: raw.city || c.city || "",
        essay: raw.essay || c.essay || "",
        achievements: raw.achievements || c.achievements || "",
        experience_years: raw.experience_years ?? c.experience_years ?? 0,
        total_score: raw.total_score ?? raw.ai_total_score ?? ai.total_score ?? 0,
        leadership_label: raw.leadership_label || raw.ai_label || ai.leadership_label || "",
        rationale: raw.rationale || ai.rationale || "",
        breakdown: raw.breakdown ?? ai.breakdown ?? null,
        status,
        created_at: raw.created_at || new Date().toISOString(),
    };
}

export async function listCandidates(): Promise<Candidate[]> {
    const res = await axios.get("/api/candidates");
    const data = res.data;
    const items: unknown[] = Array.isArray(data) ? data : (data.candidates ?? data.items ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((r: any) => mapCandidate(r));
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
    try {
        const res = await axios.get(`/api/candidates/${id}`);
        return mapCandidate(res.data);
    } catch {
        return null;
    }
}

export async function analyzeCandidate(data: CandidateEntry): Promise<Candidate> {
    const res = await axios.post("/api/analyze", data);
    const r = res.data;
    const ai = r.ai || {};
    return {
        id: r.candidate_id,
        ...data,
        total_score: ai.total_score ?? 0,
        leadership_label: ai.leadership_label || "",
        rationale: ai.rationale || "",
        breakdown: ai.breakdown ?? null,
        status: "pending",
        created_at: new Date().toISOString(),
    };
}

export async function setDecision(
    id: string,
    decision: "Approved" | "Interview" | "Pending",
    note = "Решение принято"
): Promise<void> {
    const statusMap: Record<string, string> = { "Approved": "approved", "Interview": "interview", "Pending": "pending" };
    await axios.patch(`/api/candidates/${id}/status`, {
        status: statusMap[decision] ?? "pending",
    });
}

export async function getMetrics(): Promise<Record<string, unknown>> {
    const res = await axios.get("/api/metrics");
    return res.data;
}
