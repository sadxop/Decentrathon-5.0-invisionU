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

export type NotificationType = "top" | "risk" | "new" | "info";

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    created_at: string;
    read: boolean;
    candidateId?: string;
    route?: string;
}

export interface AuditLogEntry {
    id: string;
    action: "status_changed" | "navigation" | "system";
    message: string;
    created_at: string;
    candidateId?: string;
}
