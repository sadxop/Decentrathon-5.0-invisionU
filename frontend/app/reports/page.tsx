"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Clock3, ShieldCheck } from "lucide-react";
import { getAuditLogs } from "@/lib/storage";
import { AuditLogEntry } from "@/lib/types";

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / (60 * 1000));
    if (mins < 1) return "только что";
    if (mins < 60) return `${mins} мин назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    return `${days} д назад`;
}

export default function ReportsPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);

    useEffect(() => {
        setLogs(getAuditLogs());
        function sync() {
            setLogs(getAuditLogs());
        }
        window.addEventListener("storage", sync);
        window.addEventListener("invisionu:storage", sync as EventListener);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("invisionu:storage", sync as EventListener);
        };
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 700px at 80% 20%, rgba(184,245,6,0.07) 0%, transparent 55%), linear-gradient(145deg,#060708,#080a0c)", color: "#f3f4f6", fontFamily: "Sora,sans-serif", padding: "28px 20px" }}>
            <div style={{ maxWidth: 980, margin: "0 auto" }}>
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18, color: "#8d9098", textDecoration: "none", fontFamily: "Rajdhani,sans-serif" }}>
                    <ArrowLeft size={14} /> Назад в Command Center
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <FileText size={18} style={{ color: "#c8f000" }} />
                    <h1 style={{ margin: 0, fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.06em" }}>REPORTS & AUDIT TRAIL</h1>
                </div>

                <div style={{ border: "1px solid #252830", borderRadius: 14, background: "linear-gradient(160deg,#141618,#0f1114)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #1e2126" }}>
                        <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, letterSpacing: "0.05em", color: "#8d9098" }}>Последние действия в системе</span>
                        <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, color: "#6b7280" }}>{logs.length} записей</span>
                    </div>

                    {logs.length === 0 ? (
                        <div style={{ padding: 24, color: "#6b7280", fontFamily: "Rajdhani,sans-serif" }}>Audit Trail пока пуст.</div>
                    ) : (
                        logs.slice(0, 120).map((entry, idx) => (
                            <div key={entry.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", borderTop: idx === 0 ? "none" : "1px solid #1a1c20" }}>
                                <ShieldCheck size={14} style={{ color: entry.action === "status_changed" ? "#c8f000" : "#60a5fa", marginTop: 2 }} />
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                        <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 13, fontWeight: 700, color: "#e5e7eb" }}>{entry.message}</span>
                                        {entry.candidateId && (
                                            <Link href={`/candidates/${entry.candidateId}`} style={{ color: "#c8f000", textDecoration: "none", fontFamily: "Rajdhani,sans-serif", fontSize: 11 }}>
                                                открыть кандидата →
                                            </Link>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: "#6b7280", fontFamily: "Rajdhani,sans-serif", fontSize: 11 }}>
                                        <Clock3 size={11} /> {timeAgo(entry.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
