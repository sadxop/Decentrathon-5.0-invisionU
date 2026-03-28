"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleHelp, Search, LayoutGrid, Users, BarChart3, FileText, Settings, MapPin, Gem, ShieldAlert, ArrowRight } from "lucide-react";
import { addAuditLog } from "@/lib/storage";
import { listCandidates } from "@/lib/api";
import { Candidate } from "@/lib/types";
import RightPanel from "@/components/RightPanel";
import ProfileMenu from "@/components/ProfileMenu";
import NotificationsPanel from "@/components/NotificationsPanel";
import { SkeletonRow } from "@/components/Skeleton";
import { useToast } from "@/lib/toast";
import HelpCenterModal from "@/components/HelpCenterModal";

const DEMO_CANDIDATES: Candidate[] = [
    { id: "demo-1", full_name: "Berik Saparov", city: "Kyzylorda", essay: "Моя цель — революционизировать цифровую логистику в Казахстане, используя распределённые системы и отказоустойчивую облачную архитектуру.", achievements: "15+ публичных репозиториев, менторство по архитектуре, мейнтейнер OSS", experience_years: 8, total_score: 98, leadership_label: "ТОП ТАЛАНТ", rationale: "Исключительное владение архитектурными паттернами и убедительные свидетельства долгосрочного владения сложными продуктовыми доменами.", status: "approved", created_at: new Date().toISOString() },
    { id: "demo-2", full_name: "Aibek Moldabekov", city: "Astana", essay: "Я создаю спокойные, масштабируемые пользовательские интерфейсы и кросс-функциональные дизайн-системы с измеримыми бизнес-результатами.", achievements: "Масштабировал продуктовый дизайн для 2M+ MAU, проводил воркшопы по discovery", experience_years: 6, total_score: 85, leadership_label: "АКТИВНЫЙ", rationale: "Сильное продуктовое мышление и коммуникативный профиль с последовательным качеством поставки и здоровой дисциплиной итераций.", status: "pending", created_at: new Date().toISOString() },
    { id: "demo-3", full_name: "Alima Zhakupova", city: "Almaty", essay: "Я сосредоточена на этичном ИИ и практических решениях в области data science для реальных ограничений государственного сектора в Центральной Азии.", achievements: "Награды за ML-исследования, вклад в гражданские платформы данных", experience_years: 4, total_score: 42, leadership_label: "РИСК", rationale: "Текущий профиль указывает на несоответствие навыков для данной роли и ограниченные свидетельства владения на уровне архитектуры.", status: "pending", created_at: new Date().toISOString() },
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

export default function Dashboard() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selected, setSelected] = useState<Candidate | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [helpOpen, setHelpOpen] = useState(false);
    const { toast } = useToast();
    const searchInputRef = useRef<HTMLInputElement>(null);

    function logNavigation(message: string) {
        addAuditLog({ action: "navigation", message });
    }

    useEffect(() => {
        listCandidates()
            .then((list) => {
                const initial = list.length > 0 ? list : DEMO_CANDIDATES;
                setCandidates(initial);
                if (initial.length > 0) setSelected(initial[0]);
            })
            .catch(() => {
                setCandidates(DEMO_CANDIDATES);
                setSelected(DEMO_CANDIDATES[0]);
            })
            .finally(() => setLoading(false));
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

    function handleStatusChange(id: string, status: Candidate["status"]) {
        setCandidates((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
        setSelected((p) => (p?.id === id ? { ...p, status } : p));
        const labels: Record<string, string> = { approved: "Кандидат одобрен ✓", interview: "Отправлен на интервью", pending: "Статус сброшен" };
        toast(labels[status], status === "approved" ? "success" : "info");
    }

    // Главная показывает только топ-кандидатов (score >= 75), отсортированных по убыванию
    const topCandidates = candidates
        .filter((c) => c.total_score >= 75)
        .sort((a, b) => b.total_score - a.total_score)
        .filter((c) => {
            const q = search.toLowerCase();
            return c.full_name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
        });

    return (
        <div className="command-center-shell">
            <div className="command-center-noise" />

            <aside className="command-rail">
                <button type="button" className="rail-logo" title="inVision U">iU</button>
                <nav className="rail-nav">
                    <Link href="/" className="rail-btn rail-btn-active" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><LayoutGrid size={17} strokeWidth={2.15} /></Link>
                    <Link href="/candidates" className="rail-btn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><Users size={17} strokeWidth={2.15} /></Link>
                    <Link href="/analytics" onClick={() => logNavigation("Переход в Analytics с дашборда")} className="rail-btn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><BarChart3 size={17} strokeWidth={2.15} /></Link>
                    <Link href="/reports" onClick={() => logNavigation("Переход в Reports с дашборда")} className="rail-btn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><FileText size={17} strokeWidth={2.15} /></Link>
                </nav>
                <Link href="/settings" onClick={() => logNavigation("Переход в Settings с дашборда")} className="rail-btn rail-settings" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}><Settings size={17} strokeWidth={2.15} /></Link>
            </aside>

            <main className="command-main">
                <header className="topbar">
                    <div className="topbar-title-wrap">
                        <div className="topbar-title">inVision U Talent Command Center</div>
                        <div className="topbar-separator" />
                        <div className="topbar-subtitle">Панель администратора</div>
                    </div>
                    <div className="topbar-actions">
                        <label className="searchbox" aria-label="Поиск кандидатов">
                            <Search size={15} strokeWidth={2} className="searchbox-icon" />
                            <input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск кандидатов..." />
                        </label>
                        <NotificationsPanel />
                        <button type="button" className="topbar-icon-btn" aria-label="help" onClick={() => { setHelpOpen(true); logNavigation("Открыт Help Center с дашборда"); }}><CircleHelp size={17} strokeWidth={2.1} /></button>
                        <ProfileMenu />
                    </div>
                </header>

                <section className="content-grid">
                    <section className="candidate-column">
                        <div className="hero-block">
                            <h1>
                                <span className="hero-white">INVISION U TALENT </span>
                                <span className="hero-neon">COMMAND CENTER</span>
                            </h1>
                            <p><span className="hero-bullet">●</span> AI-оценка кандидатов на базе ИИ (Llama 3)</p>
                        </div>

                        {/* Top pipeline header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <div className="candidate-header-row" style={{ flex: 1, marginBottom: 0 }}>
                                <span>КАНДИДАТ</span><span>ГОРОД</span><span>ОЦЕНКА ИИ</span><span>КЛАССИФИКАЦИЯ</span>
                            </div>
                        </div>

                        <div className="candidate-list">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : topCandidates.length === 0 ? (
                                <div className="candidate-empty">
                                    {candidates.length === 0 ? "Нет кандидатов. Нажмите «Добавить»." : "Нет топ-кандидатов по запросу."}
                                </div>
                            ) : (
                                topCandidates.map((c, idx) => {
                                    const badge = getBadge(c.total_score, c.leadership_label);
                                    const isSelected = selected?.id === c.id;
                                    return (
                                        <button type="button" key={c.id} onClick={() => setSelected(c)}
                                            className={isSelected ? "candidate-row candidate-row-selected" : "candidate-row"}
                                            style={{ animationDelay: `${idx * 45}ms` }}>
                                            <div className="candidate-name-wrap">
                                                <div className="candidate-avatar">
                                                    <Image src={getAvatarUrl(c.id)} alt={c.full_name} width={56} height={56} />
                                                </div>
                                                <div className="candidate-identity">
                                                    <Link href={`/candidates/${c.id}`} onClick={(e) => e.stopPropagation()}
                                                        style={{ textDecoration: "none" }}
                                                        onMouseEnter={(e) => { (e.currentTarget.querySelector(".candidate-name") as HTMLElement)!.style.color = "#c8f000"; }}
                                                        onMouseLeave={(e) => { (e.currentTarget.querySelector(".candidate-name") as HTMLElement)!.style.color = ""; }}>
                                                        <div className="candidate-name">{c.full_name}</div>
                                                    </Link>
                                                    <div className="candidate-role">{getRole(c)}</div>
                                                </div>
                                            </div>
                                            <div className="candidate-city"><MapPin size={14} strokeWidth={2.25} /><span>{c.city}</span></div>
                                            <div className="candidate-score" style={{ color: getScoreColor(c.total_score) }}>{c.total_score}</div>
                                            <div className="candidate-classification">
                                                <span className={`class-pill class-pill-${badge.tone}`}>{badge.icon}{badge.text}</span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 12 }}>
                            <Link href="/candidates" style={{
                                display: "flex", alignItems: "center", gap: 5,
                                fontFamily: "Rajdhani,sans-serif", fontSize: 12, fontWeight: 700,
                                color: "var(--muted-text)", textDecoration: "none", letterSpacing: "0.04em",
                                transition: "color 0.2s ease",
                            }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#c8f000"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = ""; }}>
                                Все кандидаты ({candidates.length}) <ArrowRight size={13} />
                            </Link>
                        </div>
                    </section>

                    <aside className="detail-column">
                        {loading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 4 }}>
                                {[80, 200, 160].map((h, i) => (
                                    <div key={i} style={{ height: h, background: "#1e2126", borderRadius: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
                                ))}
                                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                            </div>
                        ) : selected ? (
                            <RightPanel candidate={selected} onStatusChange={handleStatusChange} />
                        ) : (
                            <div className="candidate-empty">Выберите кандидата из списка.</div>
                        )}
                    </aside>
                </section>
            </main>
            <HelpCenterModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        </div>
    );
}
