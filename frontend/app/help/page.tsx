"use client";

import Link from "next/link";
import { ArrowLeft, LifeBuoy, Keyboard, BookOpenText } from "lucide-react";

const HOTKEYS = [
    { key: "Ctrl + /", description: "Открыть Help Center" },
    { key: "Ctrl + K", description: "Фокус на поиск" },
    { key: "Esc", description: "Закрыть активное окно" },
];

const FAQ = [
    { q: "Как кандидаты попадают в систему?", a: "Кандидаты добавляются автоматически через Telegram-интеграцию." },
    { q: "Как отправить кандидата на интервью?", a: "Откройте карточку кандидата и нажмите «НА ИНТЕРВЬЮ»." },
    { q: "Где посмотреть журнал действий?", a: "Откройте страницу Reports и блок Audit Trail." },
];

export default function HelpPage() {
    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 700px at 80% 20%, rgba(184,245,6,0.07) 0%, transparent 55%), linear-gradient(145deg,#060708,#080a0c)", color: "#f3f4f6", fontFamily: "Sora,sans-serif", padding: "28px 20px" }}>
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18, color: "#8d9098", textDecoration: "none", fontFamily: "Rajdhani,sans-serif" }}>
                    <ArrowLeft size={14} /> Назад в Command Center
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <LifeBuoy size={18} style={{ color: "#c8f000" }} />
                    <h1 style={{ margin: 0, fontFamily: "Rajdhani,sans-serif", letterSpacing: "0.06em" }}>HELP & SUPPORT</h1>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                    <section style={{ border: "1px solid #252830", borderRadius: 12, background: "linear-gradient(160deg,#141618,#0f1114)", padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Keyboard size={14} style={{ color: "#c8f000" }} /><span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, letterSpacing: "0.06em" }}>Горячие клавиши</span></div>
                        {HOTKEYS.map((item) => (
                            <div key={item.key} style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                                <code style={{ color: "#c8f000" }}>{item.key}</code>
                                <span style={{ color: "#8d9098", fontFamily: "Rajdhani,sans-serif" }}>{item.description}</span>
                            </div>
                        ))}
                    </section>

                    <section style={{ border: "1px solid #252830", borderRadius: 12, background: "linear-gradient(160deg,#141618,#0f1114)", padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><BookOpenText size={14} style={{ color: "#c8f000" }} /><span style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 12, letterSpacing: "0.06em" }}>FAQ</span></div>
                        {FAQ.map((item) => (
                            <div key={item.q} style={{ marginTop: 10 }}>
                                <p style={{ margin: 0, fontFamily: "Rajdhani,sans-serif", fontWeight: 700 }}>{item.q}</p>
                                <p style={{ margin: "3px 0 0", color: "#8d9098", fontFamily: "Rajdhani,sans-serif" }}>{item.a}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}
