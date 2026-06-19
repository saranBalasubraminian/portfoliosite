import { useState, useEffect, useCallback } from "react";
import { supabase, getPortfolio, savePortfolio, checkSlugAvailable, uploadPhoto } from "../lib/supabase";
import PortfolioPreview from "../components/PortfolioPreview";

const THEMES = {
  dark:  { name:"Dark",  bg:"#080810", surface:"#12121c", border:"#1e1e2e", text:"#e8e8f0", muted:"#666688" },
  light: { name:"Light", bg:"#f5f5fa", surface:"#ffffff",  border:"#e0e0ee", text:"#1a1a2e", muted:"#66667a" },
  glass: { name:"Glass", bg:"#0d1117", surface:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.09)", text:"#e6edf3", muted:"#7d8590" },
};
const ACCENTS = {
  purple: { main:"#7c6aff", light:"rgba(124,106,255,0.12)" },
  teal:   { main:"#2dd4bf", light:"rgba(45,212,191,0.12)" },
  coral:  { main:"#ff6b6b", light:"rgba(255,107,107,0.12)" },
  amber:  { main:"#f59e0b", light:"rgba(245,158,11,0.12)" },
};
const SKILLS_QUICK = ["Python","JavaScript","React","Node.js","ML","SQL","Flutter","Java","C++","Docker","Figma","Swift","TypeScript","MongoDB","FastAPI","Next.js"];

const DEFAULT = {
  slug:"", name:"", role:"", college:"", bio:"",
  avatar_url:"", skills:[], projects:[],
  socials:{ github:"", linkedin:"", twitter:"" },
  theme:"dark", accent:"purple",
};

export default function Builder({ session }) {
  const [data, setData]       = useState(DEFAULT);
  const [tab, setTab]         = useState("profile");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [preview, setPreview] = useState(false);
  const [slugStatus, setSlugStatus] = useState("idle"); // idle | checking | ok | taken | invalid
  const [slugTimer, setSlugTimer]   = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [initLoaded, setInitLoaded] = useState(false);
  const user = session.user;

  // Load existing portfolio on mount
  useEffect(() => {
    getPortfolio(user.id).then(p => {
      if (p) setData({ ...DEFAULT, ...p });
      else {
        const suggested = (user.user_metadata?.full_name || "").toLowerCase().replace(/\s+/g,"").replace(/[^a-z0-9-]/g,"").slice(0,20);
        setData(d => ({ ...d, slug: suggested, name: user.user_metadata?.full_name || "", avatar_url: user.user_metadata?.avatar_url || "" }));
      }
      setInitLoaded(true);
    });
  }, []);

  const set = (k, v) => { setData(d => ({ ...d, [k]: v })); setSaved(false); };
  const setSocial = (k, v) => { setData(d => ({ ...d, socials: { ...d.socials, [k]: v } })); setSaved(false); };
  const setProject = (i, k, v) => { setData(d => { const ps=[...d.projects]; ps[i]={...ps[i],[k]:v}; return {...d,projects:ps}; }); setSaved(false); };
  const addProject = () => setData(d => ({ ...d, projects:[...d.projects,{title:"",desc:"",link:"",tags:""}] }));
  const removeProject = i => setData(d => ({ ...d, projects: d.projects.filter((_,j)=>j!==i) }));
  const addSkill = s => { const sk=s.trim(); if(sk&&!data.skills.includes(sk)) set("skills",[...data.skills,sk]); };
  const removeSkill = s => set("skills", data.skills.filter(x=>x!==s));

  // Slug validation with debounce
  const validateSlug = useCallback((val) => {
    if (slugTimer) clearTimeout(slugTimer);
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g,"");
    if (clean !== val) { set("slug", clean); return; }
    if (val.length < 3) { setSlugStatus("invalid"); return; }
    setSlugStatus("checking");
    const t = setTimeout(async () => {
      const avail = await checkSlugAvailable(val);
      setSlugStatus(avail ? "ok" : "taken");
    }, 600);
    setSlugTimer(t);
  }, [slugTimer]);

  const handleSlugChange = (v) => { set("slug", v); validateSlug(v); };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    try { const url = await uploadPhoto(user.id, file); set("avatar_url", url); }
    catch(err) { alert("Photo upload failed: " + err.message); }
    finally { setPhotoLoading(false); }
  };

  const handleSave = async () => {
    if (!data.slug || slugStatus === "taken" || slugStatus === "invalid") return;
    setSaving(true);
    try {
      await savePortfolio(user.id, data);
      setSaved(true);
    } catch(err) { alert("Save failed: " + err.message); }
    finally { setSaving(false); }
  };

  const liveUrl = data.slug ? `https://${data.slug}.portfoliosite.app` : null;
  const theme  = THEMES[data.theme]  || THEMES.dark;
  const accent = ACCENTS[data.accent] || ACCENTS.purple;

  if (!initLoaded) return <LoadingScreen />;

  return (
    <div style={s.shell}>
      {/* ── Top bar ── */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.logo}>P</div>
          <span style={s.logoLabel}>PortfolioSite</span>
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noreferrer" style={s.liveChip}>
              ↗ {data.slug}.portfoliosite.app
            </a>
          )}
        </div>
        <div style={s.topbarRight}>
          <button onClick={() => supabase.auth.signOut()} style={s.btnGhost}>Sign out</button>
          <button onClick={handleSave} disabled={saving||saved} style={{ ...s.btnPrimary, background: saved ? "#1a3a2a" : accent.main, color: saved ? "#2dd4bf" : "#fff", border: saved ? "0.5px solid #2dd4bf44" : "none" }}>
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save & publish"}
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* ── Left panel ── */}
        <div style={{ ...s.panel, display: preview ? "none" : "flex" }}>
          <div style={s.tabs}>
            {[["profile","Profile"],["projects","Projects"],["design","Design"],["domain","Domain"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ ...s.tabBtn, borderBottom: tab===id ? `2px solid ${accent.main}` : "2px solid transparent", color: tab===id ? "#e8e8f0" : "#555566" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={s.panelScroll}>
            {tab === "profile" && (
              <div style={s.fields}>
                {/* Avatar */}
                <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
                  <div style={{ width:60, height:60, borderRadius:"50%", background:"#1a1a2e", border:"0.5px solid #2a2a3e", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {data.avatar_url
                      ? <img src={data.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <span style={{ fontSize:22, color:"#444" }}>{(data.name||"?")[0]}</span>}
                  </div>
                  <label style={{ ...s.btnGhost, cursor:"pointer", fontSize:12 }}>
                    {photoLoading ? "Uploading…" : "Upload photo"}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display:"none" }} />
                  </label>
                </div>
                <Field label="Full name"><input style={s.input} value={data.name} onChange={e=>set("name",e.target.value)} placeholder="Rahul Kumar" /></Field>
                <Field label="Role / title"><input style={s.input} value={data.role} onChange={e=>set("role",e.target.value)} placeholder="CSE Student · Developer" /></Field>
                <Field label="College"><input style={s.input} value={data.college} onChange={e=>set("college",e.target.value)} placeholder="Anna University" /></Field>
                <Field label="Bio">
                  <textarea style={{ ...s.input, resize:"vertical", minHeight:80 }} value={data.bio} onChange={e=>set("bio",e.target.value)} placeholder="Short intro about yourself…" />
                </Field>
                <Field label="Skills">
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                    {data.skills.map(sk => (
                      <span key={sk} style={s.skillTag}>
                        {sk}
                        <button onClick={()=>removeSkill(sk)} style={s.tagX}>×</button>
                      </span>
                    ))}
                  </div>
                  <SkillInput onAdd={addSkill} />
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                    {SKILLS_QUICK.filter(sk=>!data.skills.includes(sk)).slice(0,10).map(sk => (
                      <button key={sk} onClick={()=>addSkill(sk)} style={s.quickSkill}>+ {sk}</button>
                    ))}
                  </div>
                </Field>
                <p style={s.sectionHead}>Socials</p>
                {[["github","GitHub username"],["linkedin","LinkedIn handle"],["twitter","Twitter/X handle"]].map(([k,ph]) => (
                  <Field key={k} label={k.charAt(0).toUpperCase()+k.slice(1)}>
                    <input style={s.input} value={data.socials[k]||""} onChange={e=>setSocial(k,e.target.value)} placeholder={ph} />
                  </Field>
                ))}
              </div>
            )}

            {tab === "projects" && (
              <div style={s.fields}>
                {data.projects.map((p,i) => (
                  <div key={i} style={s.projectCard}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:"#555566", textTransform:"uppercase", letterSpacing:".06em" }}>Project {i+1}</span>
                      <button onClick={()=>removeProject(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"#444455", fontSize:18, lineHeight:1, padding:0 }}>×</button>
                    </div>
                    <input style={{ ...s.input, marginBottom:8 }} value={p.title} onChange={e=>setProject(i,"title",e.target.value)} placeholder="Project name" />
                    <textarea style={{ ...s.input, resize:"vertical", minHeight:60, marginBottom:8 }} value={p.desc} onChange={e=>setProject(i,"desc",e.target.value)} placeholder="What did you build?" />
                    <input style={{ ...s.input, marginBottom:8 }} value={p.link} onChange={e=>setProject(i,"link",e.target.value)} placeholder="github.com/you/project or live URL" />
                    <input style={s.input} value={p.tags} onChange={e=>setProject(i,"tags",e.target.value)} placeholder="Tags: React, Python, ML…" />
                  </div>
                ))}
                <button onClick={addProject} style={s.addProjectBtn}>+ Add project</button>
              </div>
            )}

            {tab === "design" && (
              <div style={s.fields}>
                <Field label="Theme">
                  <div style={{ display:"flex", gap:8 }}>
                    {Object.entries(THEMES).map(([k,t]) => (
                      <button key={k} onClick={()=>set("theme",k)} style={{ flex:1, padding:"12px 6px", borderRadius:10, border: data.theme===k ? `2px solid ${accent.main}` : "0.5px solid #2a2a3e", background:t.bg, cursor:"pointer", color:t.text, fontSize:12, fontFamily:"inherit", transition:"border 0.2s" }}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Accent color">
                  <div style={{ display:"flex", gap:8 }}>
                    {Object.entries(ACCENTS).map(([k,a]) => (
                      <button key={k} onClick={()=>set("accent",k)} style={{ flex:1, height:44, borderRadius:10, border: data.accent===k ? `2px solid ${a.main}` : "0.5px solid #2a2a3e", background: data.accent===k ? a.light : "transparent", cursor:"pointer", transition:"all 0.2s" }}>
                        <span style={{ display:"block", width:18, height:18, borderRadius:"50%", background:a.main, margin:"0 auto" }} />
                      </button>
                    ))}
                  </div>
                </Field>
                <div style={s.comingSoon}>
                  <p style={{ fontWeight:500, color:"#888899", marginBottom:4, fontSize:13 }}>More templates coming soon</p>
                  <p style={{ fontSize:12, color:"#444455" }}>Developer · Designer · Researcher · Minimal</p>
                </div>
              </div>
            )}

            {tab === "domain" && (
              <div style={s.fields}>
                <Field label="Your subdomain">
                  <div style={{ position:"relative" }}>
                    <input
                      style={{ ...s.input, paddingRight: 32, borderColor: slugStatus==="taken" ? "#ff6b6b66" : slugStatus==="ok" ? "#2dd4bf44" : "#1e1e2e" }}
                      value={data.slug}
                      onChange={e=>handleSlugChange(e.target.value)}
                      placeholder="rahulkumar"
                    />
                    <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:13 }}>
                      {slugStatus==="checking" && "⟳"}
                      {slugStatus==="ok"       && <span style={{ color:"#2dd4bf" }}>✓</span>}
                      {slugStatus==="taken"    && <span style={{ color:"#ff6b6b" }}>✗</span>}
                    </span>
                  </div>
                  <p style={{ fontSize:11, color: slugStatus==="taken" ? "#ff6b6b" : "#444455", marginTop:5 }}>
                    {slugStatus==="taken"   && "That name is already taken. Try another."}
                    {slugStatus==="invalid" && "Min 3 characters, letters and numbers only."}
                    {slugStatus==="ok"      && `✓ ${data.slug}.portfoliosite.app is available!`}
                    {(slugStatus==="idle"||!slugStatus) && `Will be: ${data.slug||"yourname"}.portfoliosite.app`}
                  </p>
                </Field>

                {liveUrl && (
                  <div style={s.liveBox}>
                    <p style={{ fontSize:12, color:"#555566", marginBottom:8 }}>Your live portfolio</p>
                    <a href={liveUrl} target="_blank" rel="noreferrer" style={{ color:"#7c6aff", fontSize:14, wordBreak:"break-all" }}>{liveUrl}</a>
                    <button onClick={()=>navigator.clipboard.writeText(liveUrl)} style={{ ...s.btnGhost, marginTop:10, width:"100%", justifyContent:"center" }}>
                      Copy link
                    </button>
                  </div>
                )}

                <div style={s.comingSoon}>
                  <p style={{ fontWeight:500, color:"#888899", marginBottom:4, fontSize:13 }}>Custom domain (Phase 2)</p>
                  <p style={{ fontSize:12, color:"#444455" }}>Connect yourname.com directly to your portfolio.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Preview pane ── */}
        <div style={s.previewPane}>
          <div style={s.previewBar}>
            <div style={{ display:"flex", gap:5 }}>
              {["#ff5f57","#febc2e","#28c840"].map(c=><span key={c} style={{ width:10,height:10,borderRadius:"50%",background:c }}/>)}
            </div>
            <span style={s.urlBar}>{data.slug||"yourname"}.portfoliosite.app</span>
            <button onClick={()=>setPreview(f=>!f)} style={s.btnGhost}>{preview ? "← Edit" : "⛶ Full"}</button>
          </div>
          <div style={{ flex:1, overflow:"auto" }}>
            <PortfolioPreview data={data} theme={theme} accent={accent} />
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input, textarea { font-family:'Inter',sans-serif; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#2a2a3e; border-radius:4px; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#555566", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}

function SkillInput({ onAdd }) {
  const [val, setVal] = useState("");
  return (
    <input
      style={{ ...s.input }}
      value={val}
      onChange={e=>setVal(e.target.value)}
      onKeyDown={e=>{ if(e.key==="Enter"){ onAdd(val); setVal(""); } }}
      placeholder="Type a skill + Enter"
    />
  );
}

function LoadingScreen() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080810" }}>
      <div style={{ width:28,height:28,border:"2px solid #7c6aff",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  shell:       { display:"flex", flexDirection:"column", height:"100vh", background:"#080810", fontFamily:"'Inter',sans-serif", color:"#e8e8f0", overflow:"hidden" },
  topbar:      { height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", borderBottom:"0.5px solid #1e1e2e", background:"#0c0c18", flexShrink:0 },
  topbarLeft:  { display:"flex", alignItems:"center", gap:12 },
  topbarRight: { display:"flex", alignItems:"center", gap:10 },
  logo:        { width:28,height:28,borderRadius:7,background:"#7c6aff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#fff" },
  logoLabel:   { fontSize:14, fontWeight:600, color:"#e8e8f0" },
  liveChip:    { fontSize:11, padding:"3px 10px", background:"rgba(124,106,255,0.1)", color:"#a89bff", borderRadius:20, border:"0.5px solid rgba(124,106,255,0.25)", textDecoration:"none" },
  btnGhost:    { background:"transparent", border:"0.5px solid #2a2a3e", borderRadius:8, color:"#888899", fontSize:12, padding:"6px 12px", cursor:"pointer", fontFamily:"'Inter',sans-serif" },
  btnPrimary:  { border:"none", borderRadius:8, fontSize:13, fontWeight:500, padding:"8px 16px", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.2s" },
  body:        { flex:1, display:"flex", overflow:"hidden" },
  panel:       { width:340, flexShrink:0, flexDirection:"column", borderRight:"0.5px solid #1e1e2e", background:"#0c0c18", overflow:"hidden" },
  tabs:        { display:"flex", borderBottom:"0.5px solid #1e1e2e", flexShrink:0 },
  tabBtn:      { flex:1, padding:"11px 4px", background:"transparent", border:"none", borderRadius:0, cursor:"pointer", fontSize:12, fontFamily:"'Inter',sans-serif", transition:"all 0.15s" },
  panelScroll: { flex:1, overflow:"auto", padding:"20px" },
  fields:      { display:"flex", flexDirection:"column" },
  input:       { width:"100%", background:"#12121c", border:"0.5px solid #1e1e2e", borderRadius:8, padding:"9px 12px", fontSize:13, color:"#e8e8f0", outline:"none", fontFamily:"'Inter',sans-serif", transition:"border 0.15s" },
  skillTag:    { display:"flex",alignItems:"center",gap:4,background:"rgba(124,106,255,0.12)",border:"0.5px solid rgba(124,106,255,0.25)",borderRadius:20,padding:"3px 10px",fontSize:12,color:"#a89bff" },
  tagX:        { background:"none",border:"none",cursor:"pointer",padding:0,color:"#7c6aff",fontSize:14,lineHeight:1,fontFamily:"inherit" },
  quickSkill:  { fontSize:11,padding:"3px 8px",borderRadius:20,border:"0.5px solid #2a2a3e",background:"transparent",cursor:"pointer",color:"#555566",fontFamily:"'Inter',sans-serif" },
  sectionHead: { fontSize:11,fontWeight:600,color:"#555566",textTransform:"uppercase",letterSpacing:".06em",margin:"16px 0 12px" },
  projectCard: { background:"#12121c",border:"0.5px solid #1e1e2e",borderRadius:10,padding:14,marginBottom:12 },
  addProjectBtn: { width:"100%",padding:"11px",border:"0.5px dashed #2a2a3e",borderRadius:10,background:"transparent",cursor:"pointer",color:"#555566",fontSize:13,fontFamily:"'Inter',sans-serif" },
  comingSoon:  { background:"#12121c",border:"0.5px solid #1e1e2e",borderRadius:10,padding:"14px",marginTop:16 },
  liveBox:     { background:"rgba(124,106,255,0.07)",border:"0.5px solid rgba(124,106,255,0.2)",borderRadius:10,padding:16,marginTop:4 },
  previewPane: { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  previewBar:  { height:40,display:"flex",alignItems:"center",gap:10,padding:"0 14px",borderBottom:"0.5px solid #1e1e2e",background:"#0c0c18",flexShrink:0 },
  urlBar:      { flex:1,background:"#12121c",border:"0.5px solid #1e1e2e",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#555566",fontFamily:"monospace" },
};
