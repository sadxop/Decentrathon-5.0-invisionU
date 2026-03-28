"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CheckCircle, XCircle, Clock, Gem, ShieldAlert } from "lucide-react";
import { getCandidateById, setDecision } from "@/lib/api";
import { Candidate } from "@/lib/types";
import { useToast } from "@/lib/toast";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

function getScoreColor(s: number) {
    if (s >= 75) return "#c8f000";
    if (s >= 50) return "#60a5fa";
    return "#f06c3f";
}

function getBadge(score: number, label: string) {
    if (score >= 75) return { text: label || "ТОП ТАЛАНТ", color: "#c8f000", bg: "rgba(200,240,0,0.1)", icon: <Gem size={13} /> };
    if (score >= 50) return { text: label || "АКТИВНЫЙ", color: "#b5b9c2", bg: "rgba(130,135,145,0.1)", icon: null };
    return { text: label || "РИСК", color: "#f06c3f", bg: "rgba(240,108,63,0.1)", icon: <ShieldAlert size={13} /> };
}

const STATUS_LABELS: Record<string, string> = { pending: "На рассмотрении", approved: "Одобрен", interview: "На интервью" };
const STATUS_COLORS: Record<string, string> = { pending: "#60a5fa", approved: "#c8f000", interview: "#f5a623" };

export default function CandidateProfile() {
    const { id } = useParams<{ id: string }>();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!id) return;
        getCandidateById(id)
            .then((found) => setCandidate(found))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleStatus(status: Candidate["status"]) {
        if (!candidate) return;
        const decisionMap: Record<Candidate["status"], "Approved" | "Interview" | "Pending"> = {
            approved: "Approved",
            interview: "Interview",
            pending: "Pending",
        };
        try {
            await setDecision(candidate.id, decisionMap[status]);
        } catch { /* ignore */ }
        setCandidate((p) => p ? { ...p, status } : p);
        const labels: Record<string, string> = { approved: "Кандидат одобрен", interview: "Отправлен на интервью", pending: "Статус сброшен" };
        toast(labels[status], status === "approved" ? "success" : "info");
    }

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060708", color: "#6b7280", fontFamily: "Rajdhani,sans-serif", fontSize: 16 }}>
                Загрузка...
            </div>
        );
    }

    if (!candidate) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060708", color: "#6b7280", fontFamily: "Rajdhani,sans-serif", fontSize: 16 }}>
                Кандидат не найден. <Link href="/" style={{ color: "#c8f000", marginLeft: 8 }}>← Назад</Link>
            </div>
        );
    }

    const badge = getBadge(candidate.total_score, candidate.leadership_label);
    const scoreColor = getScoreColor(candidate.total_score);

    const radarData = [
        { subject: "Лидерство", value: Math.min(100, Math.round(candidate.total_score * 1.05)) },
        { subject: "Траектория", value: Math.min(100, Math.round(candidate.total_score * 0.95)) },
        { subject: "Аутентичность", value: Math.min(100, Math.round(candidate.total_score * 1.0)) },
        { subject: "Потенциал", value: Math.min(100, Math.round(candidate.total_score * 0.9)) },
        { subject: "Коммуникация", value: Math.min(100, Math.round(candidate.total_score * 1.1)) },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 700px at 80% 20%, rgba(184,245,6,0.07) 0%, transparent 55%), linear-gradient(145deg,#060708,#080a0c)", color: "#f3f4f6", fontFamily: "Sora,sans-serif", padding: "28px 24px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* Back */}
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#6b7280", textDecoration: "none", fontFamily: "Rajdhani,sans-serif", fontSize: 13, marginBottom: 24, transition: "color 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#c8f000"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6b7280"; }}>
                    <ArrowLeft size={15} strokeWidth={2} /> Назад к списку
                </Link>

                {/* Hero */}
                <div style={{ background: "linear-gradient(160deg,#141618,#0f1114)", border: "1px solid #252830", borderRadius: 16, padding: "28px 32px", marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, background: "#1e2126", border: "2px solid #252830", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#c8f000", fontFamily: "Rajdhani,sans-serif", flexShrink: 0 }}>
                        {candidate.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 28, fontWeight: 700, margin: "0 0 6px", color: "#f3f4f6" }}>{candidate.full_name}</h1>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#8d9098", fontFamily: "Rajdhani,sans-serif", fontSize: 14 }}>
                                <MapPin size={13} /> {candidate.city}
                            </span>
                            <span style={{ color: "#4b5563", fontSize: 12 }}>•</span>
                            <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 14, color: "#8d9098" }}>{candidate.experience_years} лет опыта</span>
                            <span style={{ color: "#4b5563", fontSize: 12 }}>•</span>
                            <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: `${STATUS_COLORS[candidate.status]}22`, color: STATUS_COLORS[candidate.status], border: `1px solid ${STATUS_COLORS[candidate.status]}44` }}>
                                {STATUS_LABELS[candidate.status]}
                            </span>
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 64, fontWeight: 900, color: scoreColor, lineHeight: 1, textShadow: `0 0 20px ${scoreColor}44` }}>
                            {candidate.total_score}
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: badge.bg, color: badge.color, border: `1px solid ${badge.color}44`, fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.06em" }}>
                            {badge.icon}{badge.text}
                        </span>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                    {/* Left */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Essay */}
                        <div style={{ background: "linear-gradient(160deg,#141618,#0f1114)", border: "1px solid #252830", borderRadius: 14, padding: "20px 24px" }}>
                            <p style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#6b7280", textTransform: "uppercase", marginBottom: 12 }}>Личное эссе</p>
                            <p style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 16, color: "#c8cdd6", lineHeight: 1.5, fontStyle: "italic", borderLeft: "2px solid #c8f000", paddingLeft: 14 }}>
                                &ldquo;{candidate.essay}&rdquo;
                            </p>
                        </div>

                        {/* Achievements */}
                        <div style={{ background: "linear-gradient(160deg,#141618,#0f1114)", border: "1px solid #252830", borderRadius: 14, padding: "20px 24px" }}>
                            <p style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#6b7280", textTransform: "uppercase", marginBottom: 12 }}>Достижения</p>
                            <p style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 15, color: "#b6bbc3", lineHeight: 1.5 }}>{candidate.achievements}</p>
                        </div>

                        {/* Rationale */}
                        <div style={{ background: "linear-gradient(120deg,rgba(19,20,23,0.96),rgba(22,27,17,0.86))", border: "1px solid #2a3a10", borderRadius: 14, padding: "20px 24px" }}>
                            <p style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#c8f000", textTransform: "uppercase", marginBottom: 12 }}>Обоснование inVision AI</p>
                            <p style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 15, color: "#b6bbc3", lineHeight: 1.6 }}>{candidate.rationale}</p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                            {[
                                { status: "approved" as const, label: "ОДОБРИТЬ", icon: <CheckCircle size={15} />, primary: true },
                                { status: "interview" as const, label: "НА ИНТЕРВЬЮ", icon: <Clock size={15} />, primary: false },
                                { status: "pending" as const, label: "СБРОСИТЬ", icon: <XCircle size={15} />, primary: false },
                            ].map(({ status, label, icon, primary }) => (
                                <button key={status} onClick={() => handleStatus(status)} style={{
                                    height: 46, borderRadius: 10, border: primary ? "none" : "1px solid #32353c",
                                    background: primary ? "linear-gradient(180deg,#c8fb13,#abe300)" : candidate.status === status ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                                    color: primary ? "#0d1008" : "#d6dae2",
                                    fontFamily: "Rajdhani,sans-serif", fontSize: 13, fontWeight: 700,
                                    letterSpacing: "0.06em", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    transition: "all 0.2s ease",
                                }}>
                                    {icon}{label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right — Radar */}
                    <div style={{ background: "linear-gradient(160deg,#141618,#0f1114)", border: "1px solid #252830", borderRadius: 14, padding: "20px 16px" }}>
                        <p style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#6b7280", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Профиль компетенций</p>
                        <ResponsiveContainer width="100%" height={260}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#252830" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "Rajdhani,sans-serif" }} />
                                <Tooltip contentStyle={{ background: "#0f1114", border: "1px solid #252830", borderRadius: 8, color: "#f3f4f6", fontFamily: "Rajdhani,sans-serif" }} />
                                <Radar name="Кандидат" dataKey="value" stroke={scoreColor} fill={scoreColor} fillOpacity={0.2} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>

                        {/* Score breakdown */}
                        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                            {radarData.map((d) => (
                                <div key={d.subject}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, color: "#8d9098" }}>{d.subject}</span>
                                        <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, fontWeight: 700, color: scoreColor }}>{d.value}</span>
                                    </div>
                                    <div style={{ height: 4, background: "#1e2126", borderRadius: 2, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${d.value}%`, background: scoreColor, borderRadius: 2, transition: "width 0.8s ease" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
