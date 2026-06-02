import { createClient } from "@supabase/supabase-js";

export let supabase: any;

export function getSupabase() {
  if (typeof window === "undefined") return null;

  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn("Missing Supabase env");
      return null;
    }

    supabase = createClient(url, key);
  }

  return supabase;
}