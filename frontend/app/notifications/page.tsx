"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ArrowLeft, CheckCheck, Gem, ShieldAlert, UserPlus, Info, X, Filter } from "lucide-react";

interface Notification {
    id: number;
    type: "top" | "risk" | "new" | "info";
    title: string;
    body: string;
    time: string;
    read: boolean;
}

const ALL_NOTIFICATIONS: Notification[] = [
    { id: 1, type: "top", read: false, title: "Новый ТОП ТАЛАНТ", body: "Berik Saparov получил оценку 98 — рекомендован к одобрению.", time: "2 мин назад" },
    { id: 2, type: "risk", read: false, title: "Риск отказа", body: "Alima Zhakupova — оценка 42. Рекомендуется дополнительная проверка.", time: "15 мин назад" },
    { id: 3, type: "new", read: false, title: "Новый кандидат добавлен", body: "Aibek Moldabekov успешно проанализирован системой inVision AI.", time: "1 час назад" },
    { id: 4, type: "info", read: true, title: "Система обновлена", body: "Модель Llama 3.3 70B обновлена. Точность оценки улучшена на 4%.", time: "3 часа назад" },
    { id: 5, type: "info", read: true, title: "Экспорт завершён", body: "Отчёт по 12 кандидатам успешно экспортирован в PDF.", time: "Вчера" },
    { id: 6, type: "top", read: true, title: "Кандидат одобрен", body: "Berik Saparov переведён в статус ОДОБРЕН комиссией.", time: "Вчера" },
    { id: 7, type: "new", read: true, title: "Новый кандидат добавлен", body: "Dinara Bekova успешно проанализирована. Оценка: 76.", time: "2 дня назад" },
    { id: 8, type: "risk", read: true, title: "Низкая оценка", body: "Marat Seitkali получил оценку 38. Рекомендован к отклонению.", time: "3 дня назад" },
    { id: 9, type: "info", read: true, title: "Резервная копия создана", body: "Данные системы успешно сохранены в облачное хранилище.", time: "Неделю назад" },
    { id: 10, type: "info", read: true, title: "Новый администратор", body: "Пользователь admin2@invisionu.kz добавлен в систему.", time: "Неделю назад" },
];

const TYPE_ICON: Record<string, React.ReactNode> = {
    top: <Gem size={16} strokeWidth={2.2} style={{ color: "#c8f000" }} />,
    risk: <ShieldAlert size={16} strokeWidth={2.2} style={{ color: "#f06c3f" }} />,
    new: <UserPlus size={16} strokeWidth={2.2} style={{ color: "#60a5fa" }} />,
    info: <Info size={16} strokeWidth={2.2} style={{ color: "#8d9098" }} />,
};

const TYPE_DOT: Record<string, string> = {
    top: "#c8f000", risk: "#f06c3f", new: "#60a5fa", info: "#4b5563",
};

const TYPE_LABEL: Record<string, string> = {
    top: "ТОП ТАЛАНТ", risk: "РИСК", new: "НОВЫЙ", info: "ИНФО",
};

type Filter = "all" | "unread" | "top" | "risk" | "new" | "info";

export default function NotificationsPage() {
    const [items, setItems] = useState<Notification[]>(ALL_NOTIFICATIONS);
    const [filter, setFilter] = useState<Filter>("all");

    const unread = items.filter((n) => !n.read).length;

    function markAll() {
        setItems((p) => p.map((n) => ({ ...n, read: true })));
    }

    function dismiss(id: number) {
        setItems((p) => p.filter((n) => n.id !== id));
    }

    function markOne(id: number) {
        setItems((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
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

                {/* Back + Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                    <Link href="/" style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, borderRadius: 10,
                        border: "1px solid #252830", background: "rgba(255,255,255,0.03)",
                        color: "#8d9098", textDecoration: "none",
                        transition: "all 0.2s ease",
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

                {/* Filter tabs */}
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
                                transition: "all 0.15s ease",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* List */}
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
                                onClick={() => markOne(n.id)}
                                style={{
                                    display: "flex", gap: 14, padding: "16px 20px",
                                    borderBottom: idx < filtered.length - 1 ? "1px solid #1a1c20" : "none",
                                    background: n.read ? "transparent" : "rgba(200,240,0,0.025)",
                                    cursor: "pointer", transition: "background 0.15s ease",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.read ? "transparent" : "rgba(200,240,0,0.025)"; }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: "rgba(255,255,255,0.04)", border: "1px solid #252830",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginTop: 2,
                                }}>
                                    {TYPE_ICON[n.type]}
                                </div>

                                {/* Content */}
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
                                        {n.time}
                                    </span>
                                </div>

                                {/* Dismiss */}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                                    style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        color: "#374151", padding: 4, flexShrink: 0,
                                        display: "flex", alignItems: "flex-start",
                                        borderRadius: 6, transition: "all 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#374151"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
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
