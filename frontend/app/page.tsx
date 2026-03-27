"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Bell, CircleHelp, Search, LayoutGrid, Users, BarChart3, FileText, Settings, MapPin, Gem, ShieldAlert } from "lucide-react";
import { getCandidates } from "@/lib/storage";
import { Candidate } from "@/lib/types";
import AddCandidateModal from "@/components/AddCandidateModal";
import RightPanel from "@/components/RightPanel";
import ProfileMenu from "@/components/ProfileMenu";

const DEMO_CANDIDATES: Candidate[] = [
    {
        id: "demo-1",
        full_name: "Berik Saparov",
        city: "Kyzylorda",
        essay: "Моя цель — революционизировать цифровую логистику в Казахстане, используя распределённые системы и отказоустойчивую облачную архитектуру.",
        achievements: "15+ публичных репозиториев, менторство по архитектуре, мейнтейнер OSS",
        experience_years: 8,
        total_score: 98,
        leadership_label: "ТОП ТАЛАНТ",
        rationale: "Исключительное владение архитектурными паттернами и убедительные свидетельства долгосрочного владения сложными продуктовыми доменами.",
        status: "approved",
        created_at: new Date().toISOString(),
    },
    {
        id: "demo-2",
        full_name: "Aibek Moldabekov",
        city: "Astana",
        essay: "Я создаю спокойные, масштабируемые пользовательские интерфейсы и кросс-функциональные дизайн-системы с измеримыми бизнес-результатами.",
        achievements: "Масштабировал продуктовый дизайн для 2M+ MAU, проводил воркшопы по discovery",
        experience_years: 6,
        total_score: 85,
        leadership_label: "АКТИВНЫЙ",
        rationale: "Сильное продуктовое мышление и коммуникативный профиль с последовательным качеством поставки и здоровой дисциплиной итераций.",
        status: "pending",
        created_at: new Date().toISOString(),
    },
    {
        id: "demo-3",
        full_name: "Alima Zhakupova",
        city: "Almaty",
        essay: "Я сосредоточена на этичном ИИ и практических решениях в области data science для реальных ограничений государственного сектора в Центральной Азии.",
        achievements: "Награды за ML-исследования, вклад в гражданские платформы данных",
        experience_years: 4,
        total_score: 42,
        leadership_label: "РИСК",
        rationale: "Текущий профиль указывает на несоответствие навыков для данной роли и ограниченные свидетельства владения на уровне архитектуры.",
        status: "pending",
        created_at: new Date().toISOString(),
    },
];

function getAvatarUrl(id: string) {
    if (id === "demo-1") return "https://randomuser.me/api/portraits/men/32.jpg";
    if (id === "demo-2") return "https://randomuser.me/api/portraits/men/45.jpg";
    if (id === "demo-3") return "https://randomuser.me/api/portraits/women/44.jpg";
    return `https://randomuser.me/api/portraits/men/${Math.abs(id.length * 7) % 90}.jpg`;
}

function getBadge(score: number, label: string) {
    if (score >= 75) {
        return { text: label || "ТОП ТАЛАНТ", tone: "top" as const, icon: <Gem size={12} strokeWidth={2.2} /> };
    }
    if (score >= 50) {
        return { text: label || "АКТИВНЫЙ", tone: "mid" as const, icon: null };
    }
    return { text: label || "РИСК", tone: "risk" as const, icon: <ShieldAlert size={12} strokeWidth={2.25} /> };
}

function getScoreColor(score: number) {
    if (score >= 75) return "var(--neon)";
    if (score >= 50) return "var(--muted-text)";
    return "var(--risk)";
}

export default function Dashboard() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selected, setSelected] = useState<Candidate | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const list = getCandidates();
        const initial = list.length > 0 ? list : DEMO_CANDIDATES;
        setCandidates(initial);
        if (initial.length > 0) setSelected(initial[0]);
        setReady(true);
    }, []);

    function handleAdded(c: Candidate) {
        setCandidates((p) => [c, ...p]);
        setSelected(c);
    }

    function handleStatusChange(id: string, status: Candidate["status"]) {
        setCandidates((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
        setSelected((p) => (p?.id === id ? { ...p, status } : p));
    }

    const filtered = candidates.filter(
        (c) =>
            c.full_name.toLowerCase().includes(search.toLowerCase()) ||
            c.city.toLowerCase().includes(search.toLowerCase())
    );

    function getRole(c: Candidate) {
        if (c.id === "demo-1") return "Старший Full-stack инженер";
        if (c.id === "demo-2") return "Ведущий продуктовый дизайнер";
        if (c.id === "demo-3") return "Специалист по данным";
        return `${c.experience_years} лет опыта`;
    }

    if (!ready) return null;

    return (
        <div className="command-center-shell">
            <div className="command-center-noise" />

            <aside className="command-rail">
                <button type="button" className="rail-logo" onClick={() => { setCandidates([]); setSelected(null); }} title="inVision U — Главная">iU</button>

                <nav className="rail-nav" aria-label="sections">
                    {[
                        { icon: LayoutGrid, active: true },
                        { icon: Users, active: false },
                        { icon: BarChart3, active: false },
                        { icon: FileText, active: false },
                    ].map(({ icon: Icon, active }, index) => (
                        <button key={index} type="button" className={active ? "rail-btn rail-btn-active" : "rail-btn"}>
                            <Icon size={17} strokeWidth={2.15} />
                        </button>
                    ))}
                </nav>

                <button type="button" className="rail-btn rail-settings">
                    <Settings size={17} strokeWidth={2.15} />
                </button>
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
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Поиск кандидатов..."
                            />
                        </label>
                        <button type="button" className="topbar-icon-btn" aria-label="notifications">
                            <Bell size={17} strokeWidth={2.1} />
                        </button>
                        <button type="button" className="topbar-icon-btn" aria-label="help">
                            <CircleHelp size={17} strokeWidth={2.1} />
                        </button>
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
                            <p>
                                <span className="hero-bullet">●</span>
                                AI-оценка кандидатов на базе ИИ (Llama 3)
                            </p>
                        </div>

                        <div className="candidate-header-row">
                            <span>КАНДИДАТ</span>
                            <span>ГОРОД</span>
                            <span>ОЦЕНКА ИИ</span>
                            <span>КЛАССИФИКАЦИЯ</span>
                        </div>

                        <div className="candidate-list">
                            {filtered.length === 0 ? (
                                <div className="candidate-empty">
                                    {candidates.length === 0
                                        ? "Нет кандидатов. Добавьте первый профиль."
                                        : "Ничего не найдено по запросу."}
                                </div>
                            ) : (
                                filtered.map((c, idx) => {
                                    const badge = getBadge(c.total_score, c.leadership_label);
                                    const isSelected = selected?.id === c.id;
                                    return (
                                        <button
                                            type="button"
                                            key={c.id}
                                            onClick={() => setSelected(c)}
                                            className={isSelected ? "candidate-row candidate-row-selected" : "candidate-row"}
                                            style={{ animationDelay: `${idx * 45}ms` }}
                                        >
                                            <div className="candidate-name-wrap">
                                                <div className="candidate-avatar">
                                                    <Image
                                                        src={getAvatarUrl(c.id)}
                                                        alt={c.full_name}
                                                        width={56}
                                                        height={56}
                                                    />
                                                </div>
                                                <div className="candidate-identity">
                                                    <div className="candidate-name">{c.full_name}</div>
                                                    <div className="candidate-role">{getRole(c)}</div>
                                                </div>
                                            </div>

                                            <div className="candidate-city">
                                                <MapPin size={14} strokeWidth={2.25} />
                                                <span>{c.city}</span>
                                            </div>

                                            <div className="candidate-score" style={{ color: getScoreColor(c.total_score) }}>
                                                {c.total_score}
                                            </div>

                                            <div className="candidate-classification">
                                                <span className={`class-pill class-pill-${badge.tone}`}>
                                                    {badge.icon}
                                                    {badge.text}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="list-footer">
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="add-candidate-btn"
                            >
                                + Добавить кандидата
                            </button>
                            <div className="list-meta">
                                Всего: {candidates.length} | AI 75+: {candidates.filter((c) => c.total_score >= 75).length}
                            </div>
                        </div>
                    </section>

                    <aside className="detail-column">
                        {selected ? (
                            <RightPanel
                                candidate={selected}
                                onStatusChange={handleStatusChange}
                            />
                        ) : (
                            <div className="candidate-empty">Выберите кандидата из списка.</div>
                        )}
                    </aside>
                </section>
            </main>

            {showModal && (
                <AddCandidateModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
            )}
        </div>
    );
}
