"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Bell, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { addAuditLog } from "@/lib/storage";
import { useToast } from "@/lib/toast";

export default function SettingsPage() {
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const [strictMode, setStrictMode] = useState(false);
    const { toast } = useToast();

    function toggleAlerts() {
        const next = !alertsEnabled;
        setAlertsEnabled(next);
        addAuditLog({ action: "system", message: `Настройки: уведомления ${next ? "включены" : "выключены"}.` });
        toast(`Уведомления ${next ? "включены" : "выключены"}`, "info");
    }

    function toggleStrict() {
        const next = !strictMode;
        setStrictMode(next);
        addAuditLog({ action: "system", message: `Настройки: строгий режим ${next ? "включен" : "выключен"}.` });
        toast(`Строгий режим ${next ? "включен" : "выключен"}`, "info");
    }

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 700px at 80% 20%, rgba(184,245,6,0.07) 0%, transparent 55%), linear-gradient(145deg,#060708,#080a0c)", color: "#f3f4f6", fontFamily: "Sora,sans-serif", padding: "28px 20px" }}>
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18, color: "#8d9098", textDecoration: "none", fontFamily: "Rajdhani,sans-serif" }}>
                    <ArrowLeft size={14} /> Назад в Command Center
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Settings size={18} style={{ color: "#c8f000" }} />
                    <h1 style={{ margin: 0, fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.06em" }}>SETTINGS</h1>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                    <button type="button" onClick={toggleAlerts} style={{ width: "100%", border: "1px solid #252830", borderRadius: 12, background: "linear-gradient(160deg,#141618,#0f1114)", color: "#e5e7eb", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.04em" }}><Bell size={14} /> Системные уведомления</span>
                        {alertsEnabled ? <ToggleRight size={18} style={{ color: "#c8f000" }} /> : <ToggleLeft size={18} style={{ color: "#6b7280" }} />}
                    </button>

                    <button type="button" onClick={toggleStrict} style={{ width: "100%", border: "1px solid #252830", borderRadius: 12, background: "linear-gradient(160deg,#141618,#0f1114)", color: "#e5e7eb", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.04em" }}><Shield size={14} /> Строгий режим проверки</span>
                        {strictMode ? <ToggleRight size={18} style={{ color: "#c8f000" }} /> : <ToggleLeft size={18} style={{ color: "#6b7280" }} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
