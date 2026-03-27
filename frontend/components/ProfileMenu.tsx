"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    User, Settings, Shield, LogOut,
    ChevronRight, Sun, Moon, HelpCircle
} from "lucide-react";
import { useTheme } from "@/lib/theme";

const STATIC_ITEMS = [
    { icon: User, label: "Мой профиль", sub: "Администратор" },
    { icon: Settings, label: "Настройки системы", sub: null },
    { icon: Shield, label: "Безопасность", sub: null },
    { icon: HelpCircle, label: "Помощь и поддержка", sub: null },
];

export default function ProfileMenu() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const neon = isDark ? "#c8f000" : "#5a9e00";
    const bg = isDark ? "linear-gradient(160deg,#141618,#0f1114)" : "linear-gradient(160deg,#ffffff,#f8f9fb)";
    const border = isDark ? "#252830" : "#dde0e6";
    const divider = isDark ? "#1e2126" : "#eaecf0";
    const text = isDark ? "#c8cdd6" : "#1a1e28";
    const sub = isDark ? "#4b5563" : "#8a909e";
    const chevron = isDark ? "#374151" : "#b0b8c8";
    const iconCol = isDark ? "#6b7280" : "#8a909e";
    const hoverBg = isDark ? "rgba(200,240,0,0.06)" : "rgba(90,158,0,0.06)";

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Avatar trigger */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                style={{
                    width: 38, height: 38, borderRadius: "50%",
                    border: `2px solid ${open ? neon : (isDark ? "#30343a" : "#c8d4b8")}`,
                    background: isDark ? "linear-gradient(145deg,#191d24,#10131a)" : "#fff",
                    overflow: "hidden", display: "grid", placeItems: "center",
                    padding: 0, cursor: "pointer",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: open ? `0 0 12px ${neon}4d` : "none",
                }}
                aria-label="Меню профиля"
                aria-expanded={open}
            >
                <Image
                    src="https://randomuser.me/api/portraits/men/11.jpg"
                    alt="Профиль"
                    width={38} height={38}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    width: 268, zIndex: 200,
                    background: bg, border: `1px solid ${border}`,
                    borderRadius: 14,
                    boxShadow: isDark
                        ? "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,240,0,0.06)"
                        : "0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    animation: "menuIn 0.18s ease both",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "14px 16px 12px",
                        borderBottom: `1px solid ${divider}`,
                        display: "flex", alignItems: "center", gap: 10,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            border: `2px solid ${neon}`, overflow: "hidden", flexShrink: 0,
                        }}>
                            <Image
                                src="https://randomuser.me/api/portraits/men/11.jpg"
                                alt="Профиль" width={40} height={40}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: text, fontFamily: "Rajdhani,sans-serif" }}>
                                Администратор
                            </div>
                            <div style={{ fontSize: 11, color: neon, fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.04em" }}>
                                admin@invisionu.kz
                            </div>
                        </div>
                        <div style={{
                            marginLeft: "auto", fontSize: 9, fontWeight: 700,
                            letterSpacing: "0.08em", color: isDark ? "#0d1008" : "#fff",
                            background: neon, borderRadius: 4,
                            padding: "2px 6px", fontFamily: "Rajdhani,sans-serif",
                        }}>
                            ADMIN
                        </div>
                    </div>

                    {/* Static items */}
                    <div style={{ padding: "6px 0" }}>
                        {STATIC_ITEMS.map(({ icon: Icon, label, sub: s }) => (
                            <MenuItem
                                key={label}
                                icon={<Icon size={15} strokeWidth={2} style={{ color: iconCol, flexShrink: 0 }} />}
                                label={label}
                                sub={s}
                                textColor={text}
                                subColor={sub}
                                chevronColor={chevron}
                                hoverBg={hoverBg}
                                onClick={() => setOpen(false)}
                            />
                        ))}

                        {/* Theme toggle */}
                        <div
                            style={{
                                display: "flex", alignItems: "center",
                                gap: 10, padding: "9px 16px", cursor: "pointer",
                                transition: "background 0.15s ease",
                            }}
                            onClick={toggle}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = hoverBg; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                        >
                            {isDark
                                ? <Sun size={15} strokeWidth={2} style={{ color: iconCol, flexShrink: 0 }} />
                                : <Moon size={15} strokeWidth={2} style={{ color: iconCol, flexShrink: 0 }} />
                            }
                            <span style={{ flex: 1, fontSize: 13, color: text, fontFamily: "Rajdhani,sans-serif", fontWeight: 600 }}>
                                {isDark ? "Светлая тема" : "Тёмная тема"}
                            </span>
                            {/* Toggle pill */}
                            <div style={{
                                width: 36, height: 20, borderRadius: 10,
                                background: isDark ? neon : "#d1d5db",
                                position: "relative", flexShrink: 0,
                                transition: "background 0.25s ease",
                            }}>
                                <div style={{
                                    position: "absolute", top: 3,
                                    left: isDark ? 18 : 3,
                                    width: 14, height: 14, borderRadius: "50%",
                                    background: isDark ? "#0d1008" : "#fff",
                                    transition: "left 0.25s ease",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Logout */}
                    <div style={{ borderTop: `1px solid ${divider}`, padding: "6px 0 4px" }}>
                        <MenuItem
                            icon={<LogOut size={15} strokeWidth={2} style={{ color: "var(--risk)", flexShrink: 0 }} />}
                            label="Выйти из системы"
                            sub={null}
                            textColor="var(--risk)"
                            subColor={sub}
                            chevronColor="transparent"
                            hoverBg={isDark ? "rgba(240,108,63,0.08)" : "rgba(217,79,30,0.06)"}
                            onClick={() => { setOpen(false); window.location.href = "/login"; }}
                        />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes menuIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
            `}</style>
        </div>
    );
}

/* ── helper ── */
function MenuItem({
    icon, label, sub, textColor, subColor, chevronColor, hoverBg, onClick,
}: {
    icon: React.ReactNode;
    label: string;
    sub: string | null;
    textColor: string;
    subColor: string;
    chevronColor: string;
    hoverBg: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 10, padding: "9px 16px",
                background: "transparent", border: "none",
                cursor: "pointer", textAlign: "left",
                transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
            {icon}
            <span style={{ flex: 1, fontSize: 13, color: textColor, fontFamily: "Rajdhani,sans-serif", fontWeight: 600 }}>
                {label}
            </span>
            {sub && (
                <span style={{ fontSize: 11, color: subColor, fontFamily: "Rajdhani,sans-serif" }}>
                    {sub}
                </span>
            )}
            <ChevronRight size={13} strokeWidth={2} style={{ color: chevronColor }} />
        </button>
    );
}
