import { Candidate } from "./types";

const KEY = "invisionu_candidates";

export function getCandidates(): Candidate[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
        return [];
    }
}

export function saveCandidate(c: Candidate): void {
    const list = getCandidates();
    const idx = list.findIndex((x) => x.id === c.id);
    if (idx >= 0) list[idx] = c;
    else list.unshift(c);
    localStorage.setItem(KEY, JSON.stringify(list));
}

export function updateStatus(id: string, status: Candidate["status"]): void {
    const list = getCandidates();
    const c = list.find((x) => x.id === id);
    if (c) {
        c.status = status;
        localStorage.setItem(KEY, JSON.stringify(list));
    }
}
