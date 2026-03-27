import { AppNotification, AuditLogEntry, Candidate, NotificationType } from "./types";

const KEY = "invisionu_candidates";
const NOTIFICATIONS_KEY = "invisionu_notifications";
const AUDIT_LOG_KEY = "invisionu_audit_log";

function hasWindow() {
    return typeof window !== "undefined";
}

function emitStorageChange(topic: "notifications" | "audit") {
    if (!hasWindow()) return;
    window.dispatchEvent(new CustomEvent("invisionu:storage", { detail: { topic } }));
}

function uid(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
    {
        id: uid("notif"),
        type: "top",
        title: "Новый ТОП ТАЛАНТ",
        body: "Berik Saparov получил оценку 98 — рекомендован к одобрению.",
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        read: false,
        candidateId: "demo-1",
        route: "/candidates/demo-1",
    },
    {
        id: uid("notif"),
        type: "risk",
        title: "Риск отказа",
        body: "Alima Zhakupova — оценка 42. Рекомендуется дополнительная проверка.",
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        candidateId: "demo-3",
        route: "/candidates/demo-3",
    },
    {
        id: uid("notif"),
        type: "new",
        title: "Новый кандидат обработан",
        body: "Aibek Moldabekov успешно проанализирован системой inVision AI.",
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: false,
        candidateId: "demo-2",
        route: "/candidates/demo-2",
    },
    {
        id: uid("notif"),
        type: "info",
        title: "Система обновлена",
        body: "Модель Llama 3.3 70B обновлена. Точность оценки улучшена на 4%.",
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        read: true,
        route: "/help",
    },
];

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
    {
        id: uid("audit"),
        action: "system",
        message: "Система инициализирована и готова к обработке кандидатов.",
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
];

function read<T>(key: string, fallback: T): T {
    if (!hasWindow()) return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function write<T>(key: string, value: T): void {
    if (!hasWindow()) return;
    localStorage.setItem(key, JSON.stringify(value));
}

export function getCandidates(): Candidate[] {
    return read<Candidate[]>(KEY, []);
}

export function saveCandidate(c: Candidate): void {
    const list = getCandidates();
    const idx = list.findIndex((x) => x.id === c.id);
    if (idx >= 0) list[idx] = c;
    else list.unshift(c);
    write(KEY, list);

    addNotification({
        type: "new",
        title: "Новый кандидат обработан",
        body: `${c.full_name} добавлен в pipeline и доступен для просмотра.`,
        candidateId: c.id,
        route: `/candidates/${c.id}`,
    });

    addAuditLog({
        action: "system",
        message: `Добавлен кандидат ${c.full_name}.`,
        candidateId: c.id,
    });
}

export function updateStatus(id: string, status: Candidate["status"]): void {
    const list = getCandidates();
    const c = list.find((x) => x.id === id);
    if (c) {
        c.status = status;
        write(KEY, list);
    }
}

export function getNotifications(): AppNotification[] {
    const fromStorage = read<AppNotification[]>(NOTIFICATIONS_KEY, []);
    if (fromStorage.length > 0) {
        return fromStorage.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    write(NOTIFICATIONS_KEY, DEFAULT_NOTIFICATIONS);
    return [...DEFAULT_NOTIFICATIONS].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function addNotification(params: {
    type: NotificationType;
    title: string;
    body: string;
    candidateId?: string;
    route?: string;
}) {
    const next: AppNotification = {
        id: uid("notif"),
        type: params.type,
        title: params.title,
        body: params.body,
        candidateId: params.candidateId,
        route: params.route,
        created_at: new Date().toISOString(),
        read: false,
    };

    const list = [next, ...getNotifications()];
    write(NOTIFICATIONS_KEY, list);
    emitStorageChange("notifications");
    return next;
}

export function markNotificationRead(id: string): void {
    const list = getNotifications().map((item) => (item.id === id ? { ...item, read: true } : item));
    write(NOTIFICATIONS_KEY, list);
    emitStorageChange("notifications");
}

export function markAllNotificationsRead(): void {
    const list = getNotifications().map((item) => ({ ...item, read: true }));
    write(NOTIFICATIONS_KEY, list);
    emitStorageChange("notifications");
}

export function removeNotification(id: string): void {
    const list = getNotifications().filter((item) => item.id !== id);
    write(NOTIFICATIONS_KEY, list);
    emitStorageChange("notifications");
}

export function getAuditLogs(): AuditLogEntry[] {
    const fromStorage = read<AuditLogEntry[]>(AUDIT_LOG_KEY, []);
    if (fromStorage.length > 0) {
        return fromStorage.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    write(AUDIT_LOG_KEY, DEFAULT_AUDIT_LOGS);
    return [...DEFAULT_AUDIT_LOGS];
}

export function addAuditLog(params: {
    action: AuditLogEntry["action"];
    message: string;
    candidateId?: string;
}) {
    const entry: AuditLogEntry = {
        id: uid("audit"),
        action: params.action,
        message: params.message,
        candidateId: params.candidateId,
        created_at: new Date().toISOString(),
    };

    const list = [entry, ...getAuditLogs()].slice(0, 300);
    write(AUDIT_LOG_KEY, list);
    emitStorageChange("audit");
    return entry;
}
