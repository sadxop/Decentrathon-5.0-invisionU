"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    User, Settings, Bell, Shield, LogOut,
    ChevronRight, Moon, HelpCircle
} from "lucide-react";

const MENU_ITEMS = [
    { icon: User, label: "Мой профиль", sub: "Администратор" },
    { icon: Bell, label: "Уведомления", sub: "3 новых" },
    { icon: Settings, label: "Настройки системы", sub: null },
    { icon: Shield, label: "Безопасность", sub: null },
    { icon: Moon, label: "Тёмная тема", sub: "Включена" },
    { icon: HelpCircle, label: "Помощь и поддержка", sub: null },
];

export default function ProfileMenu() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Avatar trigger */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                style={{
                    width: 38, height: 38, borderRadius: "50%",
                    border: open ? "2px solid #c8f000" : "2px solid #30343a",
                    background: "linear-gradient(145deg, #191d24, #10131a)",
                    overflow: "hidden", display: "grid", placeItems: "center",
                    padding: 0, cursor: "pointer",
                    transition: "border-color 0.2s ease",
                    boxShadow: open ? "0 0 12px rgba(200,240,0,0.3)" : "none",
                }}
                aria-label="Меню профиля"
                aria-expanded={open}
            >
                <Image
                    src="https://randomuser.me/api/portraits/men/11.jpg"
                    alt="Профиль"
                    width={38}
                    height={38}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    width: 260, zIndex: 200,
                    background: "linear-gradient(160deg, #141618, #0f1114)",
                    border: "1px solid #252830",
                    borderRadius: 14,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,240,0,0.06)",
                    overflow: "hidden",
                    animation: "menuIn 0.18s ease both",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "14px 16px 12px",
                        borderBottom: "1px solid #1e2126",
                        display: "flex", alignItems: "center", gap: 10,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            border: "2px solid #c8f000", overflow: "hidden", flexShrink: 0,
                        }}>
                            <Image
                                src="https://randomuser.me/api/portraits/men/11.jpg"
                                alt="Профиль"
                                width={40}
                                height={40}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f2f6", fontFamily: "Rajdhani, sans-serif" }}>
                                Администратор
                            </div>
                            <div style={{ fontSize: 11, color: "#c8f000", fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.04em" }}>
                                admin@invisionu.kz
                            </div>
                        </div>
                        <div style={{
                            marginLeft: "auto", fontSize: 9, fontWeight: 700,
                            letterSpacing: "0.08em", color: "#0d1008",
                            background: "#c8f000", borderRadius: 4,
                            padding: "2px 6px", fontFamily: "Rajdhani, sans-serif",
                        }}>
                            ADMIN
                        </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "6px 0" }}>
                        {MENU_ITEMS.map(({ icon: Icon, label, sub }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setOpen(false)}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center",
                                    gap: 10, padding: "9px 16px",
                                    background: "transparent", border: "none",
                                    cursor: "pointer", textAlign: "left",
                                    transition: "background 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,240,0,0.06)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }}
                            >
                                <Icon size={15} strokeWidth={2} style={{ color: "#6b7280", flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: 13, color: "#c8cdd6", fontFamily: "Rajdhani, sans-serif", fontWeight: 600 }}>
                                    {label}
                                </span>
                                {sub && (
                                    <span style={{ fontSize: 11, color: "#4b5563", fontFamily: "Rajdhani, sans-serif" }}>
                                        {sub}
                                    </span>
                                )}
                                <ChevronRight size={13} strokeWidth={2} style={{ color: "#374151" }} />
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{ borderTop: "1px solid #1e2126", padding: "6px 0 4px" }}>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            style={{
                                width: "100%", display: "flex", alignItems: "center",
                                gap: 10, padding: "9px 16px",
                                background: "transparent", border: "none",
                                cursor: "pointer", textAlign: "left",
                                transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,108,63,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                            }}
                        >
                            <LogOut size={15} strokeWidth={2} style={{ color: "#f06c3f" }} />
                            <span style={{ fontSize: 13, color: "#f06c3f", fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>
                                Выйти из системы
                            </span>
                        </button>
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
