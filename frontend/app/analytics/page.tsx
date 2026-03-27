"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Users, ShieldAlert } from "lucide-react";
import { Candidate } from "@/lib/types";
import { getCandidates } from "@/lib/storage";

const DEMO_CANDIDATES: Candidate[] = [
    { id: "demo-1", full_name: "Berik Saparov", city: "Kyzylorda", essay: "", achievements: "", experience_years: 8, total_score: 98, leadership_label: "ТОП ТАЛАНТ", rationale: "", status: "approved", created_at: new Date().toISOString() },
    { id: "demo-2", full_name: "Aibek Moldabekov", city: "Astana", essay: "", achievements: "", experience_years: 6, total_score: 85, leadership_label: "АКТИВНЫЙ", rationale: "", status: "pending", created_at: new Date().toISOString() },
    { id: "demo-3", full_name: "Alima Zhakupova", city: "Almaty", essay: "", achievements: "", experience_years: 4, total_score: 42, leadership_label: "РИСК", rationale: "", status: "pending", created_at: new Date().toISOString() },
];

export default function AnalyticsPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    useEffect(() => {
        const list = getCandidates();
        setCandidates(list.length > 0 ? list : DEMO_CANDIDATES);
    }, []);

    const stats = useMemo(() => {
        const total = candidates.length;
        const top = candidates.filter((c) => c.total_score >= 75).length;
        const risk = candidates.filter((c) => c.total_score < 50).length;
        const avg = total > 0 ? Math.round(candidates.reduce((acc, item) => acc + item.total_score, 0) / total) : 0;
        return { total, top, risk, avg };
    }, [candidates]);

    const cards = [
        { label: "Средняя AI-оценка", value: stats.avg, suffix: "%", icon: <TrendingUp size={16} />, color: "#c8f000" },
        { label: "Всего кандидатов", value: stats.total, suffix: "", icon: <Users size={16} />, color: "#60a5fa" },
        { label: "ТОП-кандидаты", value: stats.top, suffix: "", icon: <BarChart3 size={16} />, color: "#c8f000" },
        { label: "Риск-профили", value: stats.risk, suffix: "", icon: <ShieldAlert size={16} />, color: "#f06c3f" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 700px at 80% 20%, rgba(184,245,6,0.07) 0%, transparent 55%), linear-gradient(145deg,#060708,#080a0c)", color: "#f3f4f6", fontFamily: "Sora,sans-serif", padding: "28px 20px" }}>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18, color: "#8d9098", textDecoration: "none", fontFamily: "Rajdhani,sans-serif" }}>
                    <ArrowLeft size={14} /> Назад в Command Center
                </Link>
                <h1 style={{ margin: "0 0 14px", fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.06em" }}>ANALYTICS</h1>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                    {cards.map((card) => (
                        <div key={card.label} style={{ border: "1px solid #252830", borderRadius: 12, background: "linear-gradient(160deg,#141618,#0f1114)", padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, color: card.color, marginBottom: 8 }}>{card.icon}<span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, letterSpacing: "0.05em" }}>{card.label}</span></div>
                            <div style={{ fontSize: 34, lineHeight: 1, fontFamily: "Rajdhani,sans-serif", fontWeight: 700, color: "#e5e7eb" }}>{card.value}{card.suffix}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
