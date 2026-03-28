"use client";

import { useEffect, useRef } from "react";
import { addNotification } from "./storage";

function getWsUrl(): string {
    const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    return api.replace(/^https?/, "ws") + "/ws/notifications";
}

interface WsMessage {
    type: string;
    candidate_id: string;
    full_name: string;
    city: string;
    ai_total_score: number;
    ai_label: string;
}

function handleMessage(msg: WsMessage) {
    if (msg.type !== "new_candidate") return;
    const { candidate_id, full_name, city, ai_total_score } = msg;

    if (ai_total_score >= 75) {
        addNotification({
            type: "top",
            title: "Новый ТОП ТАЛАНТ",
            body: `${full_name} (${city}) — оценка ${ai_total_score}. Рекомендован к одобрению.`,
            candidateId: candidate_id,
            route: `/candidates/${candidate_id}`,
        });
    } else if (ai_total_score < 50) {
        addNotification({
            type: "risk",
            title: "Риск профиль",
            body: `${full_name} — оценка ${ai_total_score}. Требуется дополнительная проверка.`,
            candidateId: candidate_id,
            route: `/candidates/${candidate_id}`,
        });
    } else {
        addNotification({
            type: "new",
            title: "Новый кандидат обработан",
            body: `${full_name} (${city}) успешно проанализирован. Оценка: ${ai_total_score}.`,
            candidateId: candidate_id,
            route: `/candidates/${candidate_id}`,
        });
    }
}

export function useBackendNotifications() {
    const wsRef = useRef<WebSocket | null>(null);
    const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryDelay = useRef(1000);
    const unmountedRef = useRef(false);

    useEffect(() => {
        unmountedRef.current = false;

        function connect() {
            if (unmountedRef.current) return;
            const ws = new WebSocket(getWsUrl());
            wsRef.current = ws;

            ws.onopen = () => {
                retryDelay.current = 1000;
            };

            ws.onmessage = (e) => {
                try {
                    const data: WsMessage = JSON.parse(e.data);
                    handleMessage(data);
                } catch { /* ignore malformed */ }
            };

            ws.onclose = () => {
                if (unmountedRef.current) return;
                retryRef.current = setTimeout(() => {
                    retryDelay.current = Math.min(retryDelay.current * 2, 30_000);
                    connect();
                }, retryDelay.current);
            };

            ws.onerror = () => {
                ws.close();
            };
        }

        connect();

        return () => {
            unmountedRef.current = true;
            if (retryRef.current) clearTimeout(retryRef.current);
            wsRef.current?.close();
        };
    }, []);
}
