"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, X, CheckCheck, Gem, ShieldAlert, UserPlus, Info } from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead, removeNotification } from "@/lib/storage";
import { AppNotification } from "@/lib/types";

const TYPE_ICON = {
    top: <Gem size={14} strokeWidth={2.2} style={{ color: "#c8f000" }} />,
    risk: <ShieldAlert size={14} strokeWidth={2.2} style={{ color: "#f06c3f" }} />,
    new: <UserPlus size={14} strokeWidth={2.2} style={{ color: "#60a5fa" }} />,
    info: <Info size={14} strokeWidth={2.2} style={{ color: "#8d9098" }} />,
};

const TYPE_DOT: Record<string, string> = {
    top: "#c8f000", risk: "#f06c3f", new: "#60a5fa", info: "#4b5563",
};

export default function NotificationsPanel() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<AppNotification[]>([]);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const unread = items.filter((n) => !n.read).length;

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

    function syncItems() {
        setItems(getNotifications());
    }

    useEffect(() => {
        syncItems();
    }, []);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }

        function storageHandler() {
            syncItems();
        }

        document.addEventListener("mousedown", handler);
        window.addEventListener("storage", storageHandler);
        window.addEventListener("invisionu:storage", storageHandler as EventListener);
        return () => {
            document.removeEventListener("mousedown", handler);
            window.removeEventListener("storage", storageHandler);
            window.removeEventListener("invisionu:storage", storageHandler as EventListener);
        };
    }, []);

    function markAll() {
        markAllNotificationsRead();
        syncItems();
    }

    function markOne(id: string) {
        markNotificationRead(id);
        syncItems();
    }

    function dismiss(id: string) {
        removeNotification(id);
        syncItems();
    }

    function openNotification(item: AppNotification) {
        markOne(item.id);
        const route = item.route || (item.candidateId ? `/candidates/${item.candidateId}` : "/notifications");
        setOpen(false);
        router.push(route);
    }

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Bell button */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                style={{
                    width: 38, height: 38, borderRadius: 10,
                    border: open ? "1px solid rgba(200,240,0,0.3)" : "1px solid transparent",
                    background: open ? "rgba(200,240,0,0.08)" : "transparent",
                    color: open ? "#c8f000" : "#8c9199",
                    display: "grid", placeItems: "center",
                    cursor: "pointer", position: "relative",
                    transition: "all 0.2s ease",
                }}
                aria-label="Уведомления"
            >
                <Bell size={17} strokeWidth={2.1} />
                {unread > 0 && (
                    <span style={{
                        position: "absolute", top: 6, right: 6,
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#c8f000",
                        boxShadow: "0 0 6px rgba(200,240,0,0.8)",
                        border: "1.5px solid #0a0b0d",
                    }} />
                )}
            </button>

            {/* Panel */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    width: 340, zIndex: 200,
                    background: "linear-gradient(160deg,#141618,#0f1114)",
                    border: "1px solid #252830",
                    borderRadius: 14,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,240,0,0.05)",
                    overflow: "hidden",
                    animation: "menuIn 0.18s ease both",
                }}>
                    {/* Header */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px 12px",
                        borderBottom: "1px solid #1e2126",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Bell size={15} strokeWidth={2.2} style={{ color: "#c8f000" }} />
                            <span style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, fontSize: 13, color: "#e5e7eb", letterSpacing: "0.06em" }}>
                                УВЕДОМЛЕНИЯ
                            </span>
                            {unread > 0 && (
                                <span style={{
                                    background: "#c8f000", color: "#0d1008",
                                    fontFamily: "Rajdhani,sans-serif", fontWeight: 700,
                                    fontSize: 10, borderRadius: 6, padding: "1px 6px",
                                }}>
                                    {unread}
                                </span>
                            )}
                        </div>
                        {unread > 0 && (
                            <button
                                type="button" onClick={markAll}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 4,
                                    color: "#c8f000", fontFamily: "Rajdhani,sans-serif",
                                    fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                                }}
                            >
                                <CheckCheck size={13} strokeWidth={2.2} />
                                Прочитать все
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: 380, overflowY: "auto" }}>
                        {items.length === 0 ? (
                            <div style={{
                                padding: "32px 16px", textAlign: "center",
                                color: "#4b5563", fontFamily: "Rajdhani,sans-serif", fontSize: 14,
                            }}>
                                Нет уведомлений
                            </div>
                        ) : (
                            items.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => openNotification(n)}
                                    style={{
                                        display: "flex", gap: 12, padding: "12px 16px",
                                        borderBottom: "1px solid #1a1c20",
                                        background: n.read ? "transparent" : "rgba(200,240,0,0.03)",
                                        cursor: "pointer", transition: "background 0.15s ease",
                                        position: "relative",
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.read ? "transparent" : "rgba(200,240,0,0.03)"; }}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid #252830",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        marginTop: 2,
                                    }}>
                                        {TYPE_ICON[n.type]}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                            <span style={{
                                                fontFamily: "Rajdhani,sans-serif", fontWeight: 700,
                                                fontSize: 13, color: "#e5e7eb",
                                            }}>
                                                {n.title}
                                            </span>
                                            {!n.read && (
                                                <span style={{
                                                    width: 6, height: 6, borderRadius: "50%",
                                                    background: TYPE_DOT[n.type], flexShrink: 0,
                                                }} />
                                            )}
                                        </div>
                                        <p style={{
                                            fontFamily: "Rajdhani,sans-serif", fontSize: 12,
                                            color: "#6b7280", lineHeight: 1.4, margin: 0,
                                        }}>
                                            {n.body}
                                        </p>
                                        <span style={{
                                            fontFamily: "Rajdhani,sans-serif", fontSize: 11,
                                            color: "#374151", marginTop: 4, display: "block",
                                        }}>
                                            {timeAgo(n.created_at)}
                                        </span>
                                    </div>

                                    {/* Dismiss */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                                        style={{
                                            background: "none", border: "none", cursor: "pointer",
                                            color: "#374151", padding: 2, flexShrink: 0,
                                            display: "flex", alignItems: "flex-start",
                                            transition: "color 0.15s ease",
                                        }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}
                                    >
                                        <X size={13} strokeWidth={2} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div style={{
                            padding: "10px 16px",
                            borderTop: "1px solid #1e2126",
                            textAlign: "center",
                        }}>
                            <Link
                                href="/notifications"
                                onClick={() => setOpen(false)}
                                style={{
                                    display: "inline-block",
                                    fontFamily: "Rajdhani,sans-serif", fontSize: 12,
                                    color: "#4b5563", letterSpacing: "0.04em",
                                    textDecoration: "none",
                                    transition: "color 0.15s ease",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#c8f000"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#4b5563"; }}
                            >
                                Посмотреть все уведомления →
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes menuIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
