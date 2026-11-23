import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role") || "customer";
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has a profile in public.users
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // If user signed up with role=provider but has no provider_profile yet
      if ((profile?.role === "provider" || role === "provider")) {
        const { data: providerProfile } = await supabase
          .from("provider_profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (!providerProfile) {
          return NextResponse.redirect(new URL("/onboarding/kyc-capture?role=provider", requestUrl.origin));
        }
        return NextResponse.redirect(new URL("/provider/dashboard", requestUrl.origin));
      }

      if (next) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      return NextResponse.redirect(new URL("/explore", requestUrl.origin));
    }
  }

  // If error occurred or no code, redirect to login with error message
  const loginUrl = new URL("/auth/login", requestUrl.origin);
  loginUrl.searchParams.set("error", "Authentication failed. Please try again.");
  return NextResponse.redirect(loginUrl);
}
