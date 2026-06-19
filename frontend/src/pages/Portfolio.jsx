import { useState, useEffect } from "react";
import { getPortfolioBySlug } from "../lib/supabase";
import PortfolioPreview from "../components/PortfolioPreview";

const THEMES = {
  dark:  { bg:"#080810", surface:"#12121c", border:"#1e1e2e", text:"#e8e8f0", muted:"#666688" },
  light: { bg:"#f5f5fa", surface:"#ffffff",  border:"#e0e0ee", text:"#1a1a2e", muted:"#66667a" },
  glass: { bg:"#0d1117", surface:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.09)", text:"#e6edf3", muted:"#7d8590" },
};
const ACCENTS = {
  purple: { main:"#7c6aff", light:"rgba(124,106,255,0.12)" },
  teal:   { main:"#2dd4bf", light:"rgba(45,212,191,0.12)" },
  coral:  { main:"#ff6b6b", light:"rgba(255,107,107,0.12)" },
  amber:  { main:"#f59e0b", light:"rgba(245,158,11,0.12)" },
};

export default function Portfolio({ slug }) {
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState("loading"); // loading | found | notfound

  useEffect(() => {
    getPortfolioBySlug(slug)
      .then(p => { setData(p); setStatus("found"); })
      .catch(() => setStatus("notfound"));
  }, [slug]);

  if (status === "loading") return <Splash />;
  if (status === "notfound") return <NotFound slug={slug} />;

  const theme  = THEMES[data.theme]  || THEMES.dark;
  const accent = ACCENTS[data.accent] || ACCENTS.purple;

  return (
    <div style={{ fontFamily:"'Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <PortfolioPreview data={data} theme={theme} accent={accent} isLive />
    </div>
  );
}

function Splash() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080810" }}>
      <div style={{ width:28,height:28,border:"2px solid #7c6aff",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function NotFound({ slug }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080810",fontFamily:"'Inter',sans-serif",color:"#e8e8f0",textAlign:"center",padding:24 }}>
      <div style={{ fontSize:48,marginBottom:16 }}>🔍</div>
      <h1 style={{ fontSize:22,fontWeight:600,marginBottom:8 }}>Portfolio not found</h1>
      <p style={{ color:"#555566",marginBottom:24 }}>
        <span style={{ color:"#7c6aff",fontFamily:"monospace" }}>{slug}.portfoliosite.app</span> hasn't been set up yet.
      </p>
      <a href="https://portfoliosite.app" style={{ padding:"10px 20px",background:"#7c6aff",color:"#fff",borderRadius:8,textDecoration:"none",fontSize:14 }}>
        Create yours free →
      </a>
    </div>
  );
}
