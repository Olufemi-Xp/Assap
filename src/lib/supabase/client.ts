import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_SUPABASE_URL = "https://ksmmpbqluzkumfuecddw.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbW1wYnFsdXprdW1mdWVjZGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0MjEzMDEsImV4cCI6MjExMDk5NzMwMX0.NjU7YrVWgex3AouKfw6cNchWx7XmnX1Jc-DYgIuIE88";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY
  );
}
