import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Portfolio CRUD ──────────────────────────────────────────────
export async function getPortfolio(userId) {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function getPortfolioBySlug(slug) {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

export async function savePortfolio(userId, portfolioData) {
  const { data: existing } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("portfolios")
      .update({ ...portfolioData, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("portfolios")
      .insert({ user_id: userId, ...portfolioData })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function checkSlugAvailable(slug) {
  const { data } = await supabase
    .from("portfolios")
    .select("slug")
    .eq("slug", slug)
    .single();
  return !data;
}

// ── Storage (profile photos) ─────────────────────────────────────
export async function uploadPhoto(userId, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
