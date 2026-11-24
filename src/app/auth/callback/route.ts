import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const role = (requestUrl.searchParams.get("role") || "customer") as "customer" | "provider" | "admin";
  const next = requestUrl.searchParams.get("next");
  const authError = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Determine true client-facing origin taking reverse proxies (x-forwarded-host, x-forwarded-proto) into account
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
  const host = forwardedHost || requestUrl.host;
  const origin = `${forwardedProto}://${host}`;
  const isHttps = forwardedProto === "https";

  // If provider returned an error, redirect to landing with the error message
  if (authError || errorDescription) {
    console.error("Auth callback error:", authError, errorDescription);
    const loginUrl = new URL("/", origin);
    loginUrl.searchParams.set(
      "error",
      errorDescription || authError || "Authentication was cancelled or failed. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  // Handle either OAuth code exchange OR Email confirmation token_hash
  if (code || (token_hash && type)) {
    const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = [];

    // Create client that captures every cookie to be set
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(incomingCookies: Array<{ name: string; value: string; options: CookieOptions }>) {
            incomingCookies.forEach((c) => cookiesToSet.push(c));
          },
        },
      }
    );

    let sessionUser: any = null;
    let authOperationError: string | null = null;

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        authOperationError = error.message;
      } else {
        sessionUser = data?.user;
      }
    } else if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (error) {
        authOperationError = error.message;
      } else {
        sessionUser = data?.user;
      }
    }

    if (sessionUser) {
      // 1. Ensure user profile exists in public.users (safety net if database trigger did not run)
      try {
        const adminClient = createAdminClient();
        const { data: existingUser } = await adminClient
          .from("users")
          .select("id, role")
          .eq("id", sessionUser.id)
          .single();

        if (!existingUser) {
          const userFullName =
            sessionUser.user_metadata?.full_name ||
            sessionUser.user_metadata?.name ||
            sessionUser.email?.split("@")[0] ||
            "User";

          await adminClient.from("users").insert({
            id: sessionUser.id,
            email: sessionUser.email || "",
            full_name: userFullName,
            role: role || "customer",
          });
        }
      } catch (profileErr) {
        console.error("Warning: Could not sync public.users record:", profileErr);
      }

      // 2. Determine target destination
      let destination = next || "/explore";

      // If user is a provider, check if KYC onboarding is completed
      if (role === "provider" || sessionUser.user_metadata?.role === "provider") {
        try {
          const adminClient = createAdminClient();
          const { data: providerProfile } = await adminClient
            .from("provider_profiles")
            .select("id")
            .eq("user_id", sessionUser.id)
            .single();

          if (!providerProfile) {
            destination = "/onboarding/kyc-capture?role=provider";
          } else {
            destination = "/provider/dashboard";
          }
        } catch {
          destination = "/onboarding/kyc-capture?role=provider";
        }
      }

      // Validate destination is safe and relative
      if (destination.startsWith("http://") || destination.startsWith("https://")) {
        try {
          const destUrl = new URL(destination);
          if (destUrl.host !== host) {
            destination = "/explore";
          }
        } catch {
          destination = "/explore";
        }
      }

      if (destination === "/") {
        destination = "/explore";
      }

      const redirectUrl = destination.startsWith("/")
        ? `${origin}${destination}`
        : `${origin}/${destination}`;

      const response = NextResponse.redirect(redirectUrl);

      // CRITICAL FIX: Set all auth cookies explicitly on the outgoing NextResponse.redirect!
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          secure: isHttps ? (options.secure ?? true) : false,
          sameSite: (options.sameSite as any) ?? "lax",
          path: options.path ?? "/",
        });
      });

      return response;
    } else {
      console.error("Authentication verification failed:", authOperationError);
      const loginUrl = new URL("/", origin);
      loginUrl.searchParams.set(
        "error",
        authOperationError || "Failed to verify authentication session. Please try again."
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  const loginUrl = new URL("/", origin);
  loginUrl.searchParams.set("error", "No authentication code or verification token provided.");
  return NextResponse.redirect(loginUrl);
}
