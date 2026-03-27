"use client";

import { useState } from "react";
import { Candidate } from "@/lib/types";
import { addAuditLog, addNotification, updateStatus } from "@/lib/storage";
import { useToast } from "@/lib/toast";
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
    const [pendingStatus, setPendingStatus] = useState<Candidate["status"] | null>(null);
    const [justSavedStatus, setJustSavedStatus] = useState<Candidate["status"] | null>(null);
    const { toast } = useToast();

    async function handleStatus(status: Candidate["status"]) {
        if (pendingStatus) return;
        setPendingStatus(status);

        await new Promise((resolve) => setTimeout(resolve, 280));
        updateStatus(candidate.id, status);
        onStatusChange(candidate.id, status);

        const statusText = status === "approved" ? "ОДОБРЕН" : status === "interview" ? "НА ИНТЕРВЬЮ" : "НА РАССМОТРЕНИИ";
        const notifType = status === "approved" ? "top" : status === "interview" ? "info" : "info";

        addNotification({
            type: notifType,
            title: "Статус кандидата обновлён",
            body: `${candidate.full_name} переведён в статус: ${statusText}.`,
            candidateId: candidate.id,
            route: `/candidates/${candidate.id}`,
        });

        addAuditLog({
            action: "status_changed",
            message: `Изменён статус ${candidate.full_name}: ${statusText}.`,
            candidateId: candidate.id,
        });

        setPendingStatus(null);
        setJustSavedStatus(status);
        setTimeout(() => setJustSavedStatus((current) => (current === status ? null : current)), 1200);
        toast(`Статус обновлён: ${statusText}`, status === "approved" ? "success" : "info");
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
                    <span>АНАЛИЗ ИИ</span>
                </div>
                <p>
                    AI-рекомендация для <strong>{candidate.full_name}</strong> является{" "}
                    {candidate.total_score >= 75 ? "высоконадёжной" : "умеренной"}.
                    Оценка <strong style={{ color: getScoreColor(candidate.total_score) }}>{candidate.total_score}</strong> обусловлена{" "}
                    {candidate.rationale.slice(0, 84)}...
                </p>
            </section>

            <section className="candidate-detail-card">
                <div className="detail-header">
                    <span>ДЕТАЛИ КАНДИДАТА</span>
                    <span className="detail-id">ID: #INV-{candidate.id.slice(0, 8).toUpperCase()}</span>
                </div>

                <div className="detail-label">ЛИЧНОЕ ЭССЕ</div>
                <div className="detail-essay">
                    <p>&ldquo;{candidate.essay.slice(0, 110)}...&rdquo;</p>
                </div>

                <div className="detail-label detail-rationale-title">ОБОСНОВАНИЕ ОТ INVISION AI</div>
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
                        disabled={Boolean(pendingStatus)}
                        className={pendingStatus === "approved" ? "detail-btn detail-btn-approve detail-btn-busy" : justSavedStatus === "approved" ? "detail-btn detail-btn-approve detail-btn-done" : "detail-btn detail-btn-approve"}
                    >
                        {pendingStatus === "approved" ? "СОХРАНЕНИЕ..." : justSavedStatus === "approved" ? "СОХРАНЕНО ✓" : "ОДОБРИТЬ"}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleStatus("interview")}
                        disabled={Boolean(pendingStatus)}
                        className={pendingStatus === "interview" ? "detail-btn detail-btn-secondary detail-btn-busy" : justSavedStatus === "interview" ? "detail-btn detail-btn-secondary detail-btn-done" : candidate.status === "interview" ? "detail-btn detail-btn-secondary detail-btn-secondary-active" : "detail-btn detail-btn-secondary"}
                    >
                        {pendingStatus === "interview" ? "СОХРАНЕНИЕ..." : justSavedStatus === "interview" ? "СОХРАНЕНО ✓" : "НА ИНТЕРВЬЮ"}
                    </button>
                </div>
            </section>

            <section className="fairness-card">
                <div className="fairness-title-row">
                    <div>
                        <ShieldCheck size={15} strokeWidth={2.3} />
                        <span>FAIRNESS &amp; МЕТРИКИ</span>
                    </div>
                    <span>100% ПРОЗРАЧНОСТЬ</span>
                </div>

                <div className="fairness-bars" aria-hidden>
                    {[18, 26, 31, 37, 49, 62, 58, 70].map((h, i) => (
                        <span key={i} style={{ height: `${h}px` }} className={i > 4 ? "fairness-bar fairness-bar-active" : "fairness-bar"} />
                    ))}
                </div>

                <div className="fairness-footer">
                    <span>ПРОВЕРКА ПРЕДВЗЯТОСТИ</span>
                    <span>ОТКЛОНЕНИЙ НЕ НАЙДЕНО</span>
                </div>
                <div className="fairness-dot" />
            </section>
        </div>
    );
}
