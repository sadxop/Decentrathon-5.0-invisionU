"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, Gem, ShieldAlert, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, Users, BarChart3, FileText, Settings, CircleHelp } from "lucide-react";
import { addAuditLog, getCandidates } from "@/lib/storage";
import { Candidate } from "@/lib/types";
import { SkeletonRow } from "@/components/Skeleton";
import ProfileMenu from "@/components/ProfileMenu";
import NotificationsPanel from "@/components/NotificationsPanel";
import HelpCenterModal from "@/components/HelpCenterModal";

const PAGE_SIZE = 8;

const DEMO_CANDIDATES: Candidate[] = [
    { id: "demo-1", full_name: "Berik Saparov", city: "Kyzylorda", essay: "Моя цель — революционизировать цифровую логистику в Казахстане.", achievements: "15+ публичных репозиториев", experience_years: 8, total_score: 98, leadership_label: "ТОП ТАЛАНТ", rationale: "Исключительное владение архитектурными паттернами.", status: "approved", created_at: new Date().toISOString() },
    { id: "demo-2", full_name: "Aibek Moldabekov", city: "Astana", essay: "Я создаю масштабируемые пользовательские интерфейсы.", achievements: "Масштабировал дизайн для 2M+ MAU", experience_years: 6, total_score: 85, leadership_label: "АКТИВНЫЙ", rationale: "Сильное продуктовое мышление.", status: "pending", created_at: new Date().toISOString() },
    { id: "demo-3", full_name: "Alima Zhakupova", city: "Almaty", essay: "Я сосредоточена на этичном ИИ.", achievements: "Награды за ML-исследования", experience_years: 4, total_score: 42, leadership_label: "РИСК", rationale: "Несоответствие навыков для данной роли.", status: "pending", created_at: new Date().toISOString() },
];

function getAvatarUrl(id: string) {
    if (id === "demo-1") return "https://randomuser.me/api/portraits/men/32.jpg";
    if (id === "demo-2") return "https://randomuser.me/api/portraits/men/45.jpg";
    if (id === "demo-3") return "https://randomuser.me/api/portraits/women/44.jpg";
    return `https://randomuser.me/api/portraits/men/${Math.abs(id.length * 7) % 90}.jpg`;
}

function getBadge(score: number, label: string) {
    if (score >= 75) return { text: label || "ТОП ТАЛАНТ", tone: "top" as const, icon: <Gem size={12} strokeWidth={2.2} /> };
    if (score >= 50) return { text: label || "АКТИВНЫЙ", tone: "mid" as const, icon: null };
    return { text: label || "РИСК", tone: "risk" as const, icon: <ShieldAlert size={12} strokeWidth={2.25} /> };
}

function getScoreColor(score: number) {
    if (score >= 75) return "var(--neon)";
    if (score >= 50) return "var(--muted-text)";
    return "var(--risk)";
}

function getRole(c: Candidate) {
    if (c.id === "demo-1") return "Старший Full-stack инженер";
    if (c.id === "demo-2") return "Ведущий продуктовый дизайнер";
    if (c.id === "demo-3") return "Специалист по данным";
    return `${c.experience_years} лет опыта`;
}

type SortKey = "score_desc" | "score_asc" | "name_asc" | "date_desc";
type StatusFilter = "all" | "pending" | "approved" | "interview";

const STATUS_LABELS: Record<string, string> = { all: "Все", pending: "На рассмотрении", approved: "Одобрены", interview: "На интервью" };
const STATUS_COLORS: Record<string, string> = { pending: "#60a5fa", approved: "#c8f000", interview: "#f5a623" };

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("score_desc");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [helpOpen, setHelpOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const [sortOpen, setSortOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    function logNavigation(message: string) {
        addAuditLog({ action: "navigation", message });
    }

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        function handleHotkeys(e: KeyboardEvent) {
            if (e.ctrlKey && e.key === "/") {
                e.preventDefault();
                setHelpOpen((p) => !p);
            }
            if (e.ctrlKey && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        }

        document.addEventListener("keydown", handleHotkeys);
        return () => document.removeEventListener("keydown", handleHotkeys);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            const list = getCandidates();
            setCandidates(list.length > 0 ? list : DEMO_CANDIDATES);
            setLoading(false);
        }, 600);
    }, []);

    const processed = useMemo(() => {
        const list = candidates.filter((c) => {
            const q = search.toLowerCase();
            const matchSearch = c.full_name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
            const matchStatus = statusFilter === "all" || c.status === statusFilter;
            return matchSearch && matchStatus;
        });
        return [...list].sort((a, b) => {
            if (sortKey === "score_desc") return b.total_score - a.total_score;
            if (sortKey === "score_asc") return a.total_score - b.total_score;
            if (sortKey === "name_asc") return a.full_name.localeCompare(b.full_name);
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [candidates, search, sortKey, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
    const paginated = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => { setPage(1); }, [search, sortKey, statusFilter]);

    const STATUS_FILTERS: { key: StatusFilter }[] = [
        { key: "all" }, { key: "pending" }, { key: "approved" }, { key: "interview" },
    ];

    const SORT_OPTIONS: { key: SortKey; label: string }[] = [
        { key: "score_desc", label: "Оценка ↓" },
        { key: "score_asc", label: "Оценка ↑" },
        { key: "name_asc", label: "Имя А-Я" },
        { key: "date_desc", label: "Новые" },
    ];

    return (
        <div className="command-center-shell">
            <div className="command-center-noise" />

            {/* Sidebar */}
            <aside className="command-rail">
                <button type="button" className="rail-logo" title="iU">iU</button>
                <nav className="rail-nav">
                    <Link href="/" className="rail-btn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><LayoutGrid size={17} strokeWidth={2.15} /></Link>
                    <Link href="/candidates" className="rail-btn rail-btn-active" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><Users size={17} strokeWidth={2.15} /></Link>
                    <Link href="/analytics" onClick={() => logNavigation("Переход в Analytics со страницы кандидатов")} className="rail-btn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><BarChart3 size={17} strokeWidth={2.15} /></Link>
                    <Link href="/reports" onClick={() => logNavigation("Переход в Reports со страницы кандидатов")} className="rail-btn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><FileText size={17} strokeWidth={2.15} /></Link>
                </nav>
                <Link href="/settings" onClick={() => logNavigation("Переход в Settings со страницы кандидатов")} className="rail-btn rail-settings" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><Settings size={17} strokeWidth={2.15} /></Link>
            </aside>

            <main className="command-main">
                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-title-wrap">
                        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted-text)", textDecoration: "none", fontFamily: "Rajdhani,sans-serif", fontSize: 13 }}>
                            <ArrowLeft size={14} strokeWidth={2} /> Главная
                        </Link>
                        <div className="topbar-separator" />
                        <div className="topbar-title">Все кандидаты</div>
                    </div>
                    <div className="topbar-actions">
                        <label className="searchbox" aria-label="Поиск">
                            <Search size={15} strokeWidth={2} className="searchbox-icon" />
                            <input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по имени или городу..." />
                        </label>
                        <NotificationsPanel />
                        <button type="button" className="topbar-icon-btn" onClick={() => { setHelpOpen(true); logNavigation("Открыт Help Center со страницы кандидатов"); }}><CircleHelp size={17} strokeWidth={2.1} /></button>
                        <ProfileMenu />
                    </div>
                </header>

                {/* Content — full width, no right panel */}
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "20px 26px", gap: 14, minHeight: 0 }}>

                    {/* Controls row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {/* Status filters */}
                        <div style={{ display: "flex", gap: 4 }}>
                            {STATUS_FILTERS.map(({ key }) => (
                                <button key={key} type="button" onClick={() => setStatusFilter(key)} style={{
                                    padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                                    fontFamily: "Rajdhani,sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                                    border: "1px solid", transition: "all 0.15s ease",
                                    background: statusFilter === key ? (key === "all" ? "var(--neon)" : `${STATUS_COLORS[key] ?? "var(--neon)"}22`) : "transparent",
                                    borderColor: statusFilter === key ? (key === "all" ? "var(--neon)" : STATUS_COLORS[key] ?? "var(--neon)") : "var(--line)",
                                    color: statusFilter === key ? (key === "all" ? "#0d1008" : STATUS_COLORS[key] ?? "var(--neon)") : "var(--muted-text)",
                                }}>
                                    {STATUS_LABELS[key]}
                                    {key !== "all" && (
                                        <span style={{ marginLeft: 5, opacity: 0.7 }}>
                                            ({candidates.filter((c) => c.status === key).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Sort — custom dropdown */}
                        <div ref={sortRef} style={{ marginLeft: "auto", position: "relative" }}>
                            <button type="button" onClick={() => setSortOpen((p) => !p)} style={{
                                display: "flex", alignItems: "center", gap: 8,
                                background: sortOpen ? "rgba(200,240,0,0.08)" : "var(--panel-2)",
                                border: `1px solid ${sortOpen ? "rgba(200,240,0,0.3)" : "var(--line)"}`,
                                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                                fontFamily: "Rajdhani,sans-serif", fontSize: 12, fontWeight: 700,
                                color: "var(--muted-text)", letterSpacing: "0.04em",
                                transition: "all 0.15s ease",
                            }}>
                                <ArrowUpDown size={13} />
                                {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
                                <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: sortOpen ? "rotate(180deg)" : "none" }} />
                            </button>

                            {sortOpen && (
                                <div style={{
                                    position: "absolute", top: "calc(100% + 6px)", right: 0,
                                    background: "linear-gradient(160deg,#141618,#0f1114)",
                                    border: "1px solid #252830", borderRadius: 10,
                                    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                                    overflow: "hidden", zIndex: 100, minWidth: 140,
                                    animation: "menuIn 0.15s ease both",
                                }}>
                                    {SORT_OPTIONS.map(({ key, label }) => (
                                        <button key={key} type="button" onClick={() => { setSortKey(key); setSortOpen(false); }} style={{
                                            width: "100%", display: "flex", alignItems: "center", padding: "10px 14px",
                                            background: sortKey === key ? "rgba(200,240,0,0.08)" : "transparent",
                                            border: "none", cursor: "pointer", textAlign: "left",
                                            fontFamily: "Rajdhani,sans-serif", fontSize: 13, fontWeight: 700,
                                            color: sortKey === key ? "#c8f000" : "var(--muted-text)",
                                            letterSpacing: "0.04em", transition: "background 0.15s ease",
                                            borderLeft: sortKey === key ? "2px solid #c8f000" : "2px solid transparent",
                                        }}
                                            onMouseEnter={(e) => { if (sortKey !== key) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                                            onMouseLeave={(e) => { if (sortKey !== key) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table header */}
                    <div className="candidate-header-row" style={{ marginBottom: 0 }}>
                        <span>КАНДИДАТ</span><span>ГОРОД</span><span>ОЦЕНКА ИИ</span><span>КЛАССИФИКАЦИЯ</span>
                    </div>

                    {/* Table */}
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : paginated.length === 0 ? (
                            <div className="candidate-empty">Ничего не найдено по запросу.</div>
                        ) : (
                            paginated.map((c, idx) => {
                                const badge = getBadge(c.total_score, c.leadership_label);
                                return (
                                    <Link key={c.id} href={`/candidates/${c.id}`} style={{ textDecoration: "none" }}>
                                        <div className="candidate-row" style={{ animationDelay: `${idx * 35}ms` }}>
                                            <div className="candidate-name-wrap">
                                                <div className="candidate-avatar">
                                                    <Image src={getAvatarUrl(c.id)} alt={c.full_name} width={56} height={56} />
                                                </div>
                                                <div className="candidate-identity">
                                                    <div className="candidate-name">{c.full_name}</div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                                                        <div className="candidate-role">{getRole(c)}</div>
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                                                            fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.06em",
                                                            background: `${STATUS_COLORS[c.status] ?? "#4b5563"}22`,
                                                            color: STATUS_COLORS[c.status] ?? "#4b5563",
                                                            border: `1px solid ${STATUS_COLORS[c.status] ?? "#4b5563"}44`,
                                                        }}>
                                                            {STATUS_LABELS[c.status]}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="candidate-city"><MapPin size={14} strokeWidth={2.25} /><span>{c.city}</span></div>
                                            <div className="candidate-score" style={{ color: getScoreColor(c.total_score) }}>{c.total_score}</div>
                                            <div className="candidate-classification">
                                                <span className={`class-pill class-pill-${badge.tone}`}>{badge.icon}{badge.text}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                            <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, color: "var(--subtle-text)" }}>
                                Показано {Math.min(page * PAGE_SIZE, processed.length)} из {processed.length}
                            </span>

                            {totalPages > 1 && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{
                                        width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)",
                                        background: "transparent", color: page === 1 ? "var(--subtle-text)" : "var(--muted-text)",
                                        cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <ChevronLeft size={14} />
                                    </button>

                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button key={i} type="button" onClick={() => setPage(i + 1)} style={{
                                            width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                                            fontFamily: "Rajdhani,sans-serif", fontSize: 13, fontWeight: 700,
                                            border: "1px solid", transition: "all 0.15s ease",
                                            background: page === i + 1 ? "var(--neon)" : "transparent",
                                            borderColor: page === i + 1 ? "var(--neon)" : "var(--line)",
                                            color: page === i + 1 ? "#0d1008" : "var(--muted-text)",
                                        }}>{i + 1}</button>
                                    ))}

                                    <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                                        width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)",
                                        background: "transparent", color: page === totalPages ? "var(--subtle-text)" : "var(--muted-text)",
                                        cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <HelpCenterModal open={helpOpen} onClose={() => setHelpOpen(false)} />

            <style>{`@keyframes menuIn{from{opacity:0;transform:translateY(-4px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        </div>
    );
}


