export function SkeletonRow() {
    return (
        <div style={{
            display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1.1fr",
            gap: 12, padding: "18px 24px",
            border: "1px solid #1e2126", borderRadius: 14,
            background: "#141618", animation: "pulse 1.5s ease-in-out infinite",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, background: "#1e2126", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div style={{ height: 16, background: "#1e2126", borderRadius: 4, marginBottom: 8, width: "70%" }} />
                    <div style={{ height: 12, background: "#1a1c20", borderRadius: 4, width: "50%" }} />
                </div>
            </div>
            <div style={{ height: 16, background: "#1e2126", borderRadius: 4, alignSelf: "center" }} />
            <div style={{ height: 28, background: "#1e2126", borderRadius: 4, width: 48, alignSelf: "center" }} />
            <div style={{ height: 22, background: "#1e2126", borderRadius: 20, width: 80, alignSelf: "center" }} />
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}

export function SkeletonDetail() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "pulse 1.5s ease-in-out infinite" }}>
            {[80, 200, 160].map((h, i) => (
                <div key={i} style={{ height: h, background: "#1e2126", borderRadius: 14 }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}
