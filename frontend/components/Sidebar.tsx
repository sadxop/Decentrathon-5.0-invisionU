"use client";

import { Users, BarChart2, FileText, Settings } from "lucide-react";

const navItems = [
    { icon: "⊞", active: true },
    { icon: Users, active: false },
    { icon: BarChart2, active: false },
    { icon: FileText, active: false },
];

export default function Sidebar() {
    return (
        <aside className="w-12 flex flex-col items-center py-3 gap-1 bg-[#0a0a0a] border-r border-border shrink-0">
            {/* Logo */}
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-black text-[11px] mb-3">
                iU
            </div>

            <nav className="flex flex-col gap-1 w-full px-1.5">
                {[
                    { label: "⊞", active: true },
                    { label: "👥", active: false },
                    { label: "📊", active: false },
                    { label: "📄", active: false },
                ].map(({ label, active }, i) => (
                    <button
                        key={i}
                        className={`w-full h-8 rounded flex items-center justify-center text-sm transition-colors ${active
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <div className="mt-auto pb-1">
                <button className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <Settings className="w-3.5 h-3.5" />
                </button>
            </div>
        </aside>
    );
}
