"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        // TODO: подключить реальную авторизацию
        await new Promise((r) => setTimeout(r, 1200));
        if (email === "admin@invisionu.kz" && password === "admin") {
            window.location.href = "/";
        } else {
            setError("Неверный email или пароль");
        }
        setLoading(false);
    }

    return (
        <div style={styles.shell}>
            <div style={styles.noise} />

            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoRow}>
                    <div style={styles.logo}>iU</div>
                    <div>
                        <div style={styles.logoTitle}>inVision U</div>
                        <div style={styles.logoSub}>Talent Command Center</div>
                    </div>
                </div>

                <h1 style={styles.heading}>Вход в систему</h1>
                <p style={styles.subheading}>Войдите в панель управления кандидатами</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@invisionu.kz"
                            required
                            style={styles.input}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "#c8f000"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "#25272b"; }}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Пароль</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ ...styles.input, paddingRight: 42 }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = "#c8f000"; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = "#25272b"; }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((p) => !p)}
                                style={styles.eyeBtn}
                            >
                                {showPass
                                    ? <EyeOff size={16} strokeWidth={2} />
                                    : <Eye size={16} strokeWidth={2} />}
                            </button>
                        </div>
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading
                            ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Вход...</>
                            : <><LogIn size={16} /> Войти</>}
                    </button>
                </form>

                <div style={styles.divider}>
                    <span style={styles.dividerLine} />
                    <span style={styles.dividerText}>или</span>
                    <span style={styles.dividerLine} />
                </div>

                <p style={styles.switchText}>
                    Нет аккаунта?{" "}
                    <Link href="/register" style={styles.link}>Зарегистрироваться</Link>
                </p>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    shell: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(1100px 700px at 80% 20%, rgba(184,245,6,0.08) 0%, transparent 55%), linear-gradient(145deg,#060708,#080a0c)",
        padding: 20,
        position: "relative",
        overflow: "hidden",
    },
    noise: {
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle at 20% 80%, rgba(184,245,6,0.04) 0 16%, transparent 53%)",
    },
    card: {
        position: "relative",
        width: "100%",
        maxWidth: 420,
        background: "linear-gradient(160deg,#141618,#0f1114)",
        border: "1px solid #252830",
        borderRadius: 18,
        padding: "36px 32px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,240,0,0.05)",
        animation: "fadeUp 0.4s ease both",
    },
    logoRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 28,
    },
    logo: {
        width: 42,
        height: 42,
        background: "#c8f000",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Rajdhani, sans-serif",
        fontWeight: 900,
        fontSize: 20,
        color: "#0d1008",
        flexShrink: 0,
    },
    logoTitle: {
        fontFamily: "Rajdhani, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        color: "#c8f000",
        letterSpacing: "0.04em",
    },
    logoSub: {
        fontFamily: "Rajdhani, sans-serif",
        fontSize: 12,
        color: "#6b7280",
        letterSpacing: "0.04em",
    },
    heading: {
        fontFamily: "Sora, sans-serif",
        fontSize: 24,
        fontWeight: 800,
        color: "#f3f4f6",
        marginBottom: 6,
        letterSpacing: "-0.01em",
    },
    subheading: {
        fontFamily: "Rajdhani, sans-serif",
        fontSize: 15,
        color: "#6b7280",
        marginBottom: 28,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontFamily: "Rajdhani, sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "#8d9098",
        textTransform: "uppercase",
    },
    input: {
        width: "100%",
        background: "#0d0f12",
        border: "1px solid #25272b",
        borderRadius: 10,
        padding: "11px 14px",
        fontSize: 14,
        color: "#f3f4f6",
        outline: "none",
        fontFamily: "Sora, sans-serif",
        transition: "border-color 0.2s ease",
    },
    eyeBtn: {
        position: "absolute",
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        color: "#6b7280",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: 0,
    },
    error: {
        background: "rgba(240,108,63,0.1)",
        border: "1px solid rgba(240,108,63,0.3)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        color: "#f06c3f",
        fontFamily: "Rajdhani, sans-serif",
    },
    submitBtn: {
        marginTop: 4,
        height: 48,
        borderRadius: 10,
        border: "none",
        background: "linear-gradient(180deg,#c8fb13,#abe300)",
        color: "#0d1008",
        fontFamily: "Rajdhani, sans-serif",
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "0.06em",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 0.2s ease, transform 0.2s ease",
    },
    divider: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "24px 0 16px",
    },
    dividerLine: {
        flex: 1,
        height: 1,
        background: "#1e2126",
    },
    dividerText: {
        fontFamily: "Rajdhani, sans-serif",
        fontSize: 12,
        color: "#4b5563",
        letterSpacing: "0.06em",
    },
    switchText: {
        textAlign: "center",
        fontFamily: "Rajdhani, sans-serif",
        fontSize: 14,
        color: "#6b7280",
    },
    link: {
        color: "#c8f000",
        textDecoration: "none",
        fontWeight: 700,
    },
};
