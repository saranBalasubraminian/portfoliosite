import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Builder from "./pages/Builder";
import Portfolio from "./pages/Portfolio";
import AuthScreen from "./pages/AuthScreen";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if viewing a portfolio subdomain
  // Ignore vercel.app, localhost, and similar hosting domains — only treat as subdomain on our real domain
  const hostname = window.location.hostname;
  const isHostingDomain = hostname.endsWith(".vercel.app") || hostname.endsWith(".netlify.app") || hostname === "localhost" || hostname === "127.0.0.1";
  const isSubdomain = !isHostingDomain && hostname.split(".").length > 2 && !hostname.startsWith("www");
  const slug = isSubdomain ? hostname.split(".")[0] : null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <Splash />;
  if (slug) return <Portfolio slug={slug} />;
  if (!session) return <AuthScreen />;
  return <Builder session={session} />;
}

function Splash() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#080810" }}>
      <div style={{ width:32, height:32, border:"2px solid #7c6aff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
