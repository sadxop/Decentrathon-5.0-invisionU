import Link from "next/link";

export default function NotFound() {
    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(1100px 700px at 80% 20%, rgba(184,245,6,0.07) 0%, transparent 55%), linear-gradient(145deg,#060708,#080a0c)",
            fontFamily: "Sora, sans-serif", color: "#f3f4f6", padding: 24,
        }}>
            <div style={{ textAlign: "center", maxWidth: 480 }}>
                <div style={{
                    fontFamily: "Rajdhani,sans-serif", fontSize: 120, fontWeight: 900,
                    color: "#c8f000", lineHeight: 1, letterSpacing: "-0.04em",
                    textShadow: "0 0 60px rgba(200,240,0,0.3)",
                }}>404</div>

                <h1 style={{ fontFamily: "Rajdhani,sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "0.06em", margin: "16px 0 10px", color: "#e5e7eb" }}>
                    СТРАНИЦА НЕ НАЙДЕНА
                </h1>
                <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
                    Запрошенная страница не существует или была перемещена.
                </p>

                <Link href="/" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(180deg,#c8fb13,#abe300)",
                    color: "#0d1008", borderRadius: 10, padding: "12px 28px",
                    fontFamily: "Rajdhani,sans-serif", fontSize: 15, fontWeight: 700,
                    letterSpacing: "0.06em", textDecoration: "none",
                    transition: "opacity 0.2s ease",
                }}>
                    ← Вернуться на главную
                </Link>
            </div>
        </div>
    );
}
