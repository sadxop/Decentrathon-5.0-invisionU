"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ArrowLeft, CheckCheck, Gem, ShieldAlert, UserPlus, Info, X } from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead, removeNotification } from "@/lib/storage";
import { AppNotification, NotificationType } from "@/lib/types";

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
    top: <Gem size={16} strokeWidth={2.2} style={{ color: "#c8f000" }} />,
    risk: <ShieldAlert size={16} strokeWidth={2.2} style={{ color: "#f06c3f" }} />,
    new: <UserPlus size={16} strokeWidth={2.2} style={{ color: "#60a5fa" }} />,
    info: <Info size={16} strokeWidth={2.2} style={{ color: "#8d9098" }} />,
};

const TYPE_DOT: Record<NotificationType, string> = {
    top: "#c8f000",
    risk: "#f06c3f",
    new: "#60a5fa",
    info: "#4b5563",
};

const TYPE_LABEL: Record<NotificationType, string> = {
    top: "ТОП ТАЛАНТ",
    risk: "РИСК",
    new: "НОВЫЙ",
    info: "ИНФО",
};

type Filter = "all" | "unread" | NotificationType;

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

export default function NotificationsPage() {
    const [items, setItems] = useState<AppNotification[]>([]);
    const [filter, setFilter] = useState<Filter>("all");
    const router = useRouter();

    function syncItems() {
        setItems(getNotifications());
    }

    useEffect(() => {
        syncItems();
    }, []);

    useEffect(() => {
        function storageHandler() {
            syncItems();
        }

        window.addEventListener("storage", storageHandler);
        window.addEventListener("invisionu:storage", storageHandler as EventListener);
        return () => {
            window.removeEventListener("storage", storageHandler);
            window.removeEventListener("invisionu:storage", storageHandler as EventListener);
        };
    }, []);

    const unread = items.filter((n) => !n.read).length;

    function markAll() {
        markAllNotificationsRead();
        syncItems();
    }

    function dismiss(id: string) {
        removeNotification(id);
        syncItems();
    }

    function openNotification(item: AppNotification) {
        markNotificationRead(item.id);
        const route = item.route || (item.candidateId ? `/candidates/${item.candidateId}` : "/notifications");
        router.push(route);
    }

    const filtered = items.filter((n) => {
        if (filter === "unread") return !n.read;
        if (filter === "all") return true;
        return n.type === filter;
    });

    const FILTERS: { key: Filter; label: string }[] = [
        { key: "all", label: "Все" },
        { key: "unread", label: "Непрочитанные" },
        { key: "top", label: "ТОП ТАЛАНТ" },
        { key: "risk", label: "Риск" },
        { key: "new", label: "Новые" },
        { key: "info", label: "Инфо" },
    ];

    return (
        <div style={{
            minHeight: "100vh",
            background: "radial-gradient(1100px 700px at 80% 20%, rgba(184,245,6,0.07) 0%, transparent 55%), linear-gradient(145deg,#060708,#080a0c)",
            color: "#f3f4f6",
            fontFamily: "Sora, sans-serif",
            padding: "32px 24px",
        }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                    <Link href="/" style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, borderRadius: 10,
                        border: "1px solid #252830", background: "rgba(255,255,255,0.03)",
                        color: "#8d9098", textDecoration: "none",
                    }}>
                        <ArrowLeft size={16} strokeWidth={2} />
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Bell size={20} strokeWidth={2} style={{ color: "#c8f000" }} />
                        <h1 style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: "0.06em", margin: 0 }}>
                            УВЕДОМЛЕНИЯ
                        </h1>
                        {unread > 0 && (
                            <span style={{
                                background: "#c8f000", color: "#0d1008",
                                fontFamily: "Rajdhani,sans-serif", fontWeight: 700,
                                fontSize: 11, borderRadius: 6, padding: "2px 8px",
                            }}>{unread}</span>
                        )}
                    </div>
                    {unread > 0 && (
                        <button onClick={markAll} style={{
                            marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
                            background: "rgba(200,240,0,0.1)", border: "1px solid rgba(200,240,0,0.2)",
                            borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                            color: "#c8f000", fontFamily: "Rajdhani,sans-serif",
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                        }}>
                            <CheckCheck size={14} strokeWidth={2.2} />
                            Прочитать все
                        </button>
                    )}
                </div>

                <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                    {FILTERS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            style={{
                                padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                                fontFamily: "Rajdhani,sans-serif", fontSize: 12, fontWeight: 700,
                                letterSpacing: "0.04em", border: "1px solid",
                                background: filter === key ? "#c8f000" : "transparent",
                                borderColor: filter === key ? "#c8f000" : "#252830",
                                color: filter === key ? "#0d1008" : "#6b7280",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div style={{
                    background: "linear-gradient(160deg,#141618,#0f1114)",
                    border: "1px solid #252830",
                    borderRadius: 14,
                    overflow: "hidden",
                }}>
                    {filtered.length === 0 ? (
                        <div style={{ padding: "48px 24px", textAlign: "center", color: "#4b5563", fontFamily: "Rajdhani,sans-serif", fontSize: 15 }}>
                            Нет уведомлений в этой категории
                        </div>
                    ) : (
                        filtered.map((n, idx) => (
                            <div
                                key={n.id}
                                onClick={() => openNotification(n)}
                                style={{
                                    display: "flex", gap: 14, padding: "16px 20px",
                                    borderBottom: idx < filtered.length - 1 ? "1px solid #1a1c20" : "none",
                                    background: n.read ? "transparent" : "rgba(200,240,0,0.025)",
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: "rgba(255,255,255,0.04)", border: "1px solid #252830",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginTop: 2,
                                }}>
                                    {TYPE_ICON[n.type]}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontFamily: "Rajdhani,sans-serif", fontWeight: 700, fontSize: 15, color: "#e5e7eb" }}>
                                            {n.title}
                                        </span>
                                        {!n.read && (
                                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: TYPE_DOT[n.type], flexShrink: 0 }} />
                                        )}
                                        <span style={{
                                            marginLeft: 2, fontSize: 9, fontWeight: 700,
                                            letterSpacing: "0.08em", padding: "1px 6px", borderRadius: 4,
                                            fontFamily: "Rajdhani,sans-serif",
                                            background: `${TYPE_DOT[n.type]}22`,
                                            color: TYPE_DOT[n.type],
                                            border: `1px solid ${TYPE_DOT[n.type]}44`,
                                        }}>
                                            {TYPE_LABEL[n.type]}
                                        </span>
                                    </div>
                                    <p style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 13, color: "#6b7280", lineHeight: 1.5, margin: "0 0 6px" }}>
                                        {n.body}
                                    </p>
                                    <span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 11, color: "#374151" }}>
                                        {timeAgo(n.created_at)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                                    style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "#374151", padding: 4, flexShrink: 0,
                                        display: "flex", alignItems: "flex-start",
                                        borderRadius: 6,
                                    }}
                                >
                                    <X size={14} strokeWidth={2} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <p style={{ textAlign: "center", marginTop: 20, fontFamily: "Rajdhani,sans-serif", fontSize: 12, color: "#374151" }}>
                    Показано {filtered.length} из {items.length} уведомлений
                </p>
            </div>
        </div>
    );
}
