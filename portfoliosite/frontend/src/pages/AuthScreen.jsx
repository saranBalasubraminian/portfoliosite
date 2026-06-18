import { supabase } from "../lib/supabase";

export default function AuthScreen() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div style={s.page}>
      <div style={s.grid} aria-hidden="true">
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} style={{ ...s.dot, opacity: Math.random() * 0.4 + 0.05 }} />
        ))}
      </div>

      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoMark}>P</div>
          <span style={s.logoText}>PortfolioSite</span>
        </div>

        <h1 style={s.headline}>
          Your portfolio,<br />
          <span style={s.accent}>live in minutes.</span>
        </h1>

        <p style={s.sub}>
          Fill in your details once. Get a real link like{" "}
          <span style={s.urlPill}>yourname.portfoliosite.app</span>
          {" "}you can share with anyone.
        </p>

        <div style={s.featureRow}>
          {["No coding needed", "Custom subdomain", "Instant updates"].map(f => (
            <div key={f} style={s.feature}>
              <span style={s.check}>✓</span> {f}
            </div>
          ))}
        </div>

        <button onClick={signIn} style={s.btn}>
          <GoogleIcon />
          Continue with Google
        </button>

        <p style={s.footnote}>Free for all college students. No credit card.</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
      `}</style>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#080810",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute", inset: 0,
    display: "grid",
    gridTemplateColumns: "repeat(15, 1fr)",
    gridTemplateRows: "repeat(8, 1fr)",
    pointerEvents: "none",
  },
  dot: {
    width: 3, height: 3,
    background: "#7c6aff",
    borderRadius: "50%",
    margin: "auto",
  },
  card: {
    position: "relative",
    background: "rgba(255,255,255,0.03)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "44px 48px",
    maxWidth: 480,
    width: "100%",
    animation: "fadeUp 0.5s ease both",
    backdropFilter: "blur(20px)",
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 32,
  },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: "#7c6aff",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: 16,
  },
  logoText: { color: "#e8e8f0", fontWeight: 600, fontSize: 16 },
  headline: {
    fontSize: 36, fontWeight: 700, lineHeight: 1.2,
    color: "#e8e8f0", marginBottom: 16,
  },
  accent: { color: "#7c6aff" },
  sub: {
    fontSize: 15, color: "#888899", lineHeight: 1.7, marginBottom: 28,
  },
  urlPill: {
    background: "rgba(124,106,255,0.15)",
    color: "#a89bff",
    padding: "1px 7px",
    borderRadius: 5,
    fontSize: 13,
    fontFamily: "monospace",
  },
  featureRow: {
    display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap",
  },
  feature: {
    fontSize: 13, color: "#666688", display: "flex", alignItems: "center", gap: 5,
  },
  check: { color: "#2dd4bf", fontWeight: 700 },
  btn: {
    width: "100%",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    padding: "13px 20px",
    background: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15, fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    color: "#1a1a2e",
    transition: "opacity 0.15s",
  },
  footnote: {
    textAlign: "center", marginTop: 14,
    fontSize: 12, color: "#444455",
  },
};
