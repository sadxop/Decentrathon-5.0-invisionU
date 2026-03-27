"use client";

import { useState } from "react";
import { analyzeCandidate, CandidateEntry } from "@/lib/api";
import { Candidate } from "@/lib/types";
import { saveCandidate } from "@/lib/storage";

interface Props {
    onClose: () => void;
    onAdded: (c: Candidate) => void;
}

const EMPTY: CandidateEntry = { full_name: "", city: "", essay: "", achievements: "", experience_years: 0 };

const inputStyle: React.CSSProperties = {
    width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: 6, padding: "7px 10px", fontSize: 12, color: "#e5e5e5",
    outline: "none", marginTop: 4
};

const labelStyle: React.CSSProperties = {
    fontSize: 10, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.08em"
};

export default function AddCandidateModal({ onClose, onAdded }: Props) {
    const [form, setForm] = useState<CandidateEntry>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: name === "experience_years" ? Number(value) : value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await analyzeCandidate(form);
            const candidate: Candidate = {
                id: crypto.randomUUID(),
                ...form, ...result,
                status: "pending",
                created_at: new Date().toISOString(),
            };
            saveCandidate(candidate);
            onAdded(candidate);
            onClose();
        } catch {
            setError("Ошибка. Проверь что бэкенд запущен и GROQ_API_KEY задан.");
        } finally {
            setLoading(false);
        }
    }

    const isValid = form.full_name.trim() && form.city.trim() && form.essay.trim() && form.achievements.trim();

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{
                background: "#141414", border: "1px solid #2a2a2a",
                borderRadius: 10, width: 480, maxWidth: "95vw",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
            }}>
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 16px", borderBottom: "1px solid #222"
                }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#e5e5e5", textTransform: "uppercase" }}>
                        Добавить кандидата
                    </span>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                            <label style={labelStyle}>Имя</label>
                            <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Berik Saparov" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Город</label>
                            <input name="city" value={form.city} onChange={handleChange} required placeholder="Алматы" style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Лет опыта</label>
                        <input name="experience_years" type="number" min={0} max={50} value={form.experience_years || ""} onChange={handleChange} placeholder="2" style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Эссе</label>
                        <textarea name="essay" value={form.essay} onChange={handleChange} required placeholder="Расскажите о себе, целях и мотивации..." rows={3} style={{ ...inputStyle, resize: "none" }} />
                    </div>

                    <div>
                        <label style={labelStyle}>Достижения</label>
                        <textarea name="achievements" value={form.achievements} onChange={handleChange} required placeholder="Проекты, награды, достижения..." rows={2} style={{ ...inputStyle, resize: "none" }} />
                    </div>

                    {error && (
                        <div style={{ background: "#2a0a0a", border: "1px solid #500", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "#f88" }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: "9px 0", borderRadius: 6, background: "transparent",
                            border: "1px solid #333", color: "#888", fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}>
                            Отмена
                        </button>
                        <button type="submit" disabled={loading || !isValid} style={{
                            flex: 1, padding: "9px 0", borderRadius: 6,
                            background: loading || !isValid ? "#4a5a00" : "#c8f000",
                            border: "none", color: "#000", fontSize: 12,
                            fontWeight: 700, cursor: loading || !isValid ? "not-allowed" : "pointer",
                            letterSpacing: "0.05em"
                        }}>
                            {loading ? "Анализирую..." : "Анализировать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
