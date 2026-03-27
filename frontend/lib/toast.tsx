"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastCtx {
    toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => { } });

export function useToast() { return useContext(Ctx); }

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = ++counter;
        setToasts((p) => [...p, { id, type, message }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    }, []);

    const remove = (id: number) => setToasts((p) => p.filter((t) => t.id !== id));

    const ICON = { success: <CheckCircle size={16} />, error: <XCircle size={16} />, info: <Info size={16} /> };
    const COLOR = { success: "#c8f000", error: "#f06c3f", info: "#60a5fa" };

    return (
        <Ctx.Provider value={{ toast }}>
            {children}
            <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
                {toasts.map((t) => (
                    <div key={t.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "#141618", border: `1px solid ${COLOR[t.type]}44`,
                        borderLeft: `3px solid ${COLOR[t.type]}`,
                        borderRadius: 10, padding: "12px 14px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        color: COLOR[t.type], minWidth: 260, maxWidth: 360,
                        animation: "toastIn 0.25s ease both",
                    }}>
                        {ICON[t.type]}
                        <span style={{ flex: 1, fontFamily: "Rajdhani,sans-serif", fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>
                            {t.message}
                        </span>
                        <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", padding: 0 }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`@keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }`}</style>
        </Ctx.Provider>
    );
}
