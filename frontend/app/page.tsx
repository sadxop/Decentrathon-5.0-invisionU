"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Bell, CircleHelp, Search, LayoutGrid, Users, BarChart3, FileText, Settings, MapPin, Gem, ShieldAlert } from "lucide-react";
import { getCandidates } from "@/lib/storage";
import { Candidate } from "@/lib/types";
import AddCandidateModal from "@/components/AddCandidateModal";
import RightPanel from "@/components/RightPanel";

const DEMO_CANDIDATES: Candidate[] = [
    {
        id: "demo-1",
        full_name: "Berik Saparov",
        city: "Kyzylorda",
        essay: "I aim to revolutionize digital logistics in Kazakhstan by leveraging distributed systems and resilient cloud architecture.",
        achievements: "15+ public repositories, architecture mentorship, OSS maintainer",
        experience_years: 8,
        total_score: 98,
        leadership_label: "TOP TALENT",
        rationale: "Exceptional proficiency in architectural patterns and strong evidence of long-term ownership across complex product domains.",
        status: "approved",
        created_at: new Date().toISOString(),
    },
    {
        id: "demo-2",
        full_name: "Aibek Moldabekov",
        city: "Astana",
        essay: "I build calm, scalable user experiences and cross-functional design systems with measurable business outcomes.",
        achievements: "Scaled product design for 2M+ MAU, led discovery workshops",
        experience_years: 6,
        total_score: 85,
        leadership_label: "ACTIVE",
        rationale: "Strong product thinking and communication profile with consistent delivery quality and healthy iteration discipline.",
        status: "pending",
        created_at: new Date().toISOString(),
    },
    {
        id: "demo-3",
        full_name: "Alima Zhakupova",
        city: "Almaty",
        essay: "I am focused on ethical AI and practical data science solutions for real public-sector constraints in Central Asia.",
        achievements: "ML research awards, civic data platform contributions",
        experience_years: 4,
        total_score: 42,
        leadership_label: "GENAI RISK",
        rationale: "Current profile indicates a skills mismatch for this specific role and limited evidence of architecture-level ownership.",
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
        return { text: label || "TOP TALENT", tone: "top" as const, icon: <Gem size={12} strokeWidth={2.2} /> };
    }
    if (score >= 50) {
        return { text: label || "ACTIVE", tone: "mid" as const, icon: null };
    }
    return { text: label || "GENAI RISK", tone: "risk" as const, icon: <ShieldAlert size={12} strokeWidth={2.25} /> };
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
        if (c.id === "demo-1") return "Senior Full-stack Engineer";
        if (c.id === "demo-2") return "Lead Product Designer";
        if (c.id === "demo-3") return "Data Scientist";
        return `${c.experience_years} years experience`;
    }

    if (!ready) return null;

    return (
        <div className="command-center-shell">
            <div className="command-center-noise" />

            <aside className="command-rail">
                <div className="rail-logo">iU</div>

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
                        <div className="topbar-subtitle">Admin Dashboard</div>
                    </div>

                    <div className="topbar-actions">
                        <label className="searchbox" aria-label="Search talents">
                            <Search size={15} strokeWidth={2} className="searchbox-icon" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search talents..."
                            />
                        </label>
                        <button type="button" className="topbar-icon-btn" aria-label="notifications">
                            <Bell size={17} strokeWidth={2.1} />
                        </button>
                        <button type="button" className="topbar-icon-btn" aria-label="help">
                            <CircleHelp size={17} strokeWidth={2.1} />
                        </button>
                        <button type="button" className="profile-pill" aria-label="profile">
                            <Image src="https://randomuser.me/api/portraits/men/11.jpg" alt="profile" width={34} height={34} />
                        </button>
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
                                AI-powered candidate assessment (powered by Llama 3)
                            </p>
                        </div>

                        <div className="candidate-header-row">
                            <span>CANDIDATE</span>
                            <span>CITY</span>
                            <span>AI SCORE</span>
                            <span>CLASSIFICATION</span>
                        </div>

                        <div className="candidate-list">
                            {filtered.length === 0 ? (
                                <div className="candidate-empty">
                                    {candidates.length === 0
                                        ? "No candidates yet. Add the first profile."
                                        : "No results for current search."}
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
                                + Add Candidate
                            </button>
                            <div className="list-meta">
                                Total: {candidates.length} | AI 75+: {candidates.filter((c) => c.total_score >= 75).length}
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
                            <div className="candidate-empty">Select a candidate from the list.</div>
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
