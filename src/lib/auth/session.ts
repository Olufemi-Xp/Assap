import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";

export interface SessionContext {
  user: User;
  role: UserRole;
  fullName: string;
}

/**
 * Resolves the signed-in user (validated against Supabase Auth) and their
 * application role from public.users using the user's authenticated session.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let role: UserRole = (user.user_metadata?.role as UserRole) || "customer";
  let fullName: string = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  try {
    const { data } = await supabase.from("users").select("role, full_name").eq("id", user.id).maybeSingle();
    if (data?.role) role = data.role as UserRole;
    if (data?.full_name) fullName = data.full_name;
  } catch {
    // Fall back to auth metadata if the profile table is unreachable.
  }

  if (!["customer", "provider", "admin"].includes(role)) role = "customer";
  return { user, role, fullName };
}
