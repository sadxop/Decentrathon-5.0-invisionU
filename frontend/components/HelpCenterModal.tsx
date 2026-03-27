"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Keyboard, LifeBuoy, BookOpenText } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
}

const HOTKEYS = [
    { keys: "Ctrl + /", action: "Открыть/закрыть справку" },
    { keys: "Ctrl + K", action: "Фокус на поиск кандидатов" },
    { keys: "Esc", action: "Закрыть модальные панели" },
];

const FAQ = [
    { q: "Откуда появляются кандидаты?", a: "Кандидаты автоматически поступают из Telegram-бота и обрабатываются системой." },
    { q: "Как поменять статус кандидата?", a: "Откройте карточку справа и выберите: ОДОБРИТЬ или НА ИНТЕРВЬЮ." },
    { q: "Где смотреть историю действий?", a: "История доступна на странице Reports в блоке Audit Trail." },
];

export default function HelpCenterModal({ open, onClose }: Props) {
    useEffect(() => {
        if (!open) return;
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1500,
                background: "rgba(3,4,6,0.72)",
                backdropFilter: "blur(2px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "min(720px, 100%)",
                    borderRadius: 14,
                    border: "1px solid #252830",
                    background: "linear-gradient(160deg,#141618,#0f1114)",
                    boxShadow: "0 28px 80px rgba(0,0,0,0.75)",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #1e2126" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <LifeBuoy size={16} strokeWidth={2.2} style={{ color: "#c8f000" }} />
                        <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: "#e5e7eb" }}>
                            HELP CENTER
                        </span>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid #252830", color: "#7c818b", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center" }}>
                        <X size={14} strokeWidth={2.2} />
                    </button>
                </div>

                <div style={{ padding: 16, display: "grid", gap: 14 }}>
                    <div style={{ border: "1px solid #252830", borderRadius: 10, padding: "12px 14px", background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Keyboard size={14} strokeWidth={2.2} style={{ color: "#c8f000" }} />
                            <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#e5e7eb" }}>ГОРЯЧИЕ КЛАВИШИ</span>
                        </div>
                        <div style={{ display: "grid", gap: 6 }}>
                            {HOTKEYS.map((item) => (
                                <div key={item.keys} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                    <code style={{ color: "#c8f000", fontSize: 12 }}>{item.keys}</code>
                                    <span style={{ color: "#8d9098", fontFamily: "Rajdhani,sans-serif", fontSize: 13 }}>{item.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ border: "1px solid #252830", borderRadius: 10, padding: "12px 14px", background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <BookOpenText size={14} strokeWidth={2.2} style={{ color: "#c8f000" }} />
                            <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#e5e7eb" }}>FAQ</span>
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                            {FAQ.map((item) => (
                                <div key={item.q}>
                                    <p style={{ margin: 0, color: "#e5e7eb", fontFamily: "Rajdhani,sans-serif", fontSize: 14, fontWeight: 700 }}>{item.q}</p>
                                    <p style={{ margin: "3px 0 0", color: "#8d9098", fontFamily: "Rajdhani,sans-serif", fontSize: 13 }}>{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderTop: "1px solid #1e2126", paddingTop: 10 }}>
                        <span style={{ color: "#6b7280", fontFamily: "Rajdhani,sans-serif", fontSize: 12 }}>
                            Нужна полная история действий?
                        </span>
                        <Link href="/reports" onClick={onClose} style={{ color: "#c8f000", textDecoration: "none", fontFamily: "Rajdhani,sans-serif", fontSize: 12, letterSpacing: "0.04em" }}>
                            Открыть Reports →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
