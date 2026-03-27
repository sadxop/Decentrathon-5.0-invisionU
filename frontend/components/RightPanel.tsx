"use client";

import { Candidate } from "@/lib/types";
import { updateStatus } from "@/lib/storage";
import { CircleAlert, CircleCheck, ShieldCheck } from "lucide-react";

interface Props {
    candidate: Candidate;
    onStatusChange: (id: string, status: Candidate["status"]) => void;
}

function getScoreColor(score: number) {
    if (score >= 75) return "var(--neon)";
    if (score >= 50) return "var(--muted-text)";
    return "var(--risk)";
}

export default function RightPanel({ candidate, onStatusChange }: Props) {
    function handleStatus(status: Candidate["status"]) {
        updateStatus(candidate.id, status);
        onStatusChange(candidate.id, status);
    }

    const bullets = candidate.rationale
        .split(/[.\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 15)
        .slice(0, 2);

    return (
        <div className="rightpanel-stack">
            <section className="explainability-card">
                <div className="explainability-title-row">
                    <CircleAlert size={16} strokeWidth={2.2} />
                    <span>EXPLAINABILITY ALERT</span>
                </div>
                <p>
                    AI recommendation for <strong>{candidate.full_name}</strong> is highly stable.
                    Score <strong style={{ color: getScoreColor(candidate.total_score) }}>{candidate.total_score}</strong> is
                    driven by {candidate.rationale.slice(0, 84)}...
                </p>
            </section>

            <section className="candidate-detail-card">
                <div className="detail-header">
                    <span>CANDIDATE DETAILS</span>
                    <span className="detail-id">ID: #INV-{candidate.id.slice(0, 8).toUpperCase()}</span>
                </div>

                <div className="detail-label">PERSONAL STATEMENT ESSAY</div>
                <div className="detail-essay">
                    <p>"{candidate.essay.slice(0, 110)}..."</p>
                </div>

                <div className="detail-label detail-rationale-title">RATIONALE FROM INVISION AI</div>
                <div className="detail-bullets">
                    {bullets.map((b, i) => (
                        <div key={i} className="detail-bullet">
                            <CircleCheck size={16} strokeWidth={2.4} />
                            <span>{b}.</span>
                        </div>
                    ))}
                </div>

                <div className="detail-actions">
                    <button
                        type="button"
                        onClick={() => handleStatus("approved")}
                        className="detail-btn detail-btn-approve"
                    >
                        ОДОБРИТЬ
                    </button>
                    <button
                        type="button"
                        onClick={() => handleStatus("interview")}
                        className={candidate.status === "interview" ? "detail-btn detail-btn-secondary detail-btn-secondary-active" : "detail-btn detail-btn-secondary"}
                    >
                        НА ИНТЕРВЬЮ
                    </button>
                </div>
            </section>

            <section className="fairness-card">
                <div className="fairness-title-row">
                    <div>
                        <ShieldCheck size={15} strokeWidth={2.3} />
                        <span>FAIRNESS &amp; METRICS</span>
                    </div>
                    <span>100% TRANSPARENCY</span>
                </div>

                <div className="fairness-bars" aria-hidden>
                    {[18, 26, 31, 37, 49, 62, 58, 70].map((h, i) => (
                        <span key={i} style={{ height: `${h}px` }} className={i > 4 ? "fairness-bar fairness-bar-active" : "fairness-bar"} />
                    ))}
                </div>

                <div className="fairness-footer">
                    <span>BIAS CHECK</span>
                    <span>NO DEVIATION FOUND</span>
                </div>
                <div className="fairness-dot" />
            </section>
        </div>
    );
}
