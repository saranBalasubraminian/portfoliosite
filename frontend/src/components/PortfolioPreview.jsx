export default function PortfolioPreview({ data, theme, accent, isLive = false }) {
  const name    = data.name    || "Your Name";
  const role    = data.role    || "Student Developer";
  const college = data.college || "";
  const bio     = data.bio     || "Welcome to my portfolio.";
  const skills  = data.skills  || [];
  const projects = (data.projects || []).filter(p => p.title);
  const socials  = data.socials || {};
  const avatar   = data.avatar_url;
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  const t = theme;
  const a = accent;

  return (
    <div style={{ background:t.bg, minHeight:"100vh", color:t.text, fontFamily:"'Inter',sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 48px",borderBottom:`0.5px solid ${t.border}`,position:"sticky",top:0,background:t.bg,zIndex:10 }}>
        <div style={{ width:36,height:36,borderRadius:9,background:a.main,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#fff" }}>
          {initials}
        </div>
        <div style={{ display:"flex",gap:28 }}>
          {["About","Projects","Contact"].map(l=>(
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize:13,color:t.muted,textDecoration:"none",cursor:"pointer" }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="about" style={{ padding:"72px 48px 60px",maxWidth:700 }}>
        <div style={{ display:"flex",alignItems:"center",gap:20,marginBottom:28 }}>
          <div style={{ width:72,height:72,borderRadius:"50%",overflow:"hidden",background:"#1a1a2e",border:`2px solid ${a.main}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
            {avatar
              ? <img src={avatar} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt={name} />
              : <span style={{ fontSize:26,color:t.muted }}>{initials}</span>}
          </div>
          <div>
            <p style={{ fontSize:12,fontWeight:600,color:a.main,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4 }}>{college}</p>
            <h1 style={{ fontSize:clamp(28,36),fontWeight:700,lineHeight:1.15,background:`linear-gradient(120deg,${t.text} 50%,${a.main})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:2 }}>{name}</h1>
            <p style={{ fontSize:16,color:t.muted,fontWeight:400 }}>{role}</p>
          </div>
        </div>
        <p style={{ fontSize:16,color:t.muted,lineHeight:1.75,maxWidth:560,marginBottom:32 }}>{bio}</p>
        <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
          <a href="#projects" style={{ padding:"10px 22px",background:a.main,color:"#fff",borderRadius:9,fontSize:13,fontWeight:500,textDecoration:"none",display:"inline-block" }}>
            View projects
          </a>
          <a href="#contact" style={{ padding:"10px 22px",background:"transparent",color:t.text,border:`0.5px solid ${t.border}`,borderRadius:9,fontSize:13,textDecoration:"none",display:"inline-block" }}>
            Get in touch
          </a>
        </div>
      </section>

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <section style={{ padding:"0 48px 56px" }}>
          <SectionLabel label="Skills" color={a.main} />
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {skills.map(sk=>(
              <span key={sk} style={{ padding:"7px 16px",background:a.light,color:a.main,border:`0.5px solid ${a.main}33`,borderRadius:20,fontSize:13,fontWeight:500 }}>
                {sk}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <section id="projects" style={{ padding:"0 48px 56px" }}>
          <SectionLabel label="Projects" color={a.main} />
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 }}>
            {projects.map((p,i)=>(
              <ProjectCard key={i} project={p} theme={t} accent={a} />
            ))}
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      <section id="contact" style={{ padding:"0 48px 56px" }}>
        <SectionLabel label="Connect" color={a.main} />
        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
          {socials.github   && <SocialBtn href={`https://github.com/${socials.github}`}     label={`GitHub · ${socials.github}`}    theme={t} />}
          {socials.linkedin && <SocialBtn href={`https://linkedin.com/in/${socials.linkedin}`} label={`LinkedIn · ${socials.linkedin}`} theme={t} />}
          {socials.twitter  && <SocialBtn href={`https://twitter.com/${socials.twitter}`}   label={`Twitter · ${socials.twitter}`}  theme={t} />}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop:`0.5px solid ${t.border}`,padding:"24px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
        <span style={{ fontSize:12,color:t.muted }}>{name}</span>
        <a href="https://portfoliosite.app" target="_blank" rel="noreferrer" style={{ fontSize:11,color:t.muted,textDecoration:"none",opacity:0.5 }}>
          Made with PortfolioSite
        </a>
      </footer>
    </div>
  );
}

function SectionLabel({ label, color }) {
  return (
    <p style={{ fontSize:11,fontWeight:600,color,letterSpacing:".1em",textTransform:"uppercase",marginBottom:20 }}>{label}</p>
  );
}

function ProjectCard({ project, theme:t, accent:a }) {
  const tags = (project.tags||"").split(",").map(x=>x.trim()).filter(Boolean);
  const isUrl = project.link && (project.link.startsWith("http")||project.link.startsWith("github.com"));
  const href  = project.link ? (project.link.startsWith("http") ? project.link : `https://${project.link}`) : null;

  return (
    <div style={{ background:t.surface,border:`0.5px solid ${t.border}`,borderRadius:12,padding:"20px",display:"flex",flexDirection:"column",gap:10,transition:"border-color 0.2s" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=a.main+"66"}
      onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
      <p style={{ fontSize:15,fontWeight:600,color:t.text }}>{project.title}</p>
      <p style={{ fontSize:13,color:t.muted,lineHeight:1.65,flex:1 }}>{project.desc}</p>
      {tags.length>0 && (
        <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
          {tags.map(tag=>(
            <span key={tag} style={{ fontSize:11,padding:"2px 8px",borderRadius:20,background:t.bg,color:t.muted,border:`0.5px solid ${t.border}` }}>{tag}</span>
          ))}
        </div>
      )}
      {href && (
        <a href={href} target="_blank" rel="noreferrer" style={{ fontSize:12,color:a.main,textDecoration:"none",display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
          ↗ {project.link.replace(/^https?:\/\//,"")}
        </a>
      )}
    </div>
  );
}

function SocialBtn({ href, label, theme:t }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:t.surface,border:`0.5px solid ${t.border}`,borderRadius:8,color:t.muted,fontSize:13,textDecoration:"none",transition:"border-color 0.15s" }}
      onMouseEnter={e=>e.currentTarget.style.color=t.text}
      onMouseLeave={e=>e.currentTarget.style.color=t.muted}>
      {label}
    </a>
  );
}

const clamp = (min, max) => `clamp(${min}px, 4vw, ${max}px)`;
