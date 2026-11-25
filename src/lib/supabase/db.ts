import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { env } from "../env.ts";

/**
 * Returns a session-authenticated Supabase client using NEXT_PUBLIC_SUPABASE_ANON_KEY
 * and request cookies (so RLS `auth.uid()` works without relying on SUPABASE_SERVICE_ROLE_KEY).
 * Uses dynamic import so standalone Node tests don't fail resolving `next/headers`.
 */
export async function createDbClient() {
  try {
    const { createServerSupabaseClient } = await import("./server.ts");
    return await createServerSupabaseClient();
  } catch {
    return createSupabaseJsClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
