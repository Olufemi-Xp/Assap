import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env.ts";

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
