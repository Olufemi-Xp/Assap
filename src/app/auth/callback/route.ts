import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePostAuthDestination } from "@/lib/routing";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const requestedRole = (requestUrl.searchParams.get("role") || "customer") as "customer" | "provider" | "admin";
  const next = requestUrl.searchParams.get("next");
  const authError = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
  const host = forwardedHost || requestUrl.host;
  const origin = `${forwardedProto}://${host}`;
  const isHttps = forwardedProto === "https";

  if (authError || errorDescription) {
    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set(
      "error",
      errorDescription || authError || "Authentication was cancelled or failed. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (code || (token_hash && type)) {
    const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = [];

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

    let sessionUser: User | null = null;
    let authOperationError: string | null = null;

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        authOperationError = error.message;
      } else {
        sessionUser = data?.user ?? null;
      }
    } else if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (error) {
        authOperationError = error.message;
      } else {
        sessionUser = data?.user ?? null;
      }
    }

    if (sessionUser) {
      let resolvedRole: string =
        (sessionUser.user_metadata?.role as string | undefined) || requestedRole || "customer";

      try {
        const adminClient = createAdminClient();
        const { data: existingUser } = await adminClient
          .from("users")
          .select("id, role")
          .eq("id", sessionUser.id)
          .maybeSingle();

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
            role: resolvedRole === "provider" ? "provider" : "customer",
          });
        } else if (existingUser.role) {
          resolvedRole = existingUser.role;
        }
      } catch (profileErr) {
        console.error("Warning: Could not sync public.users record:", profileErr);
      }

      const destination = resolvePostAuthDestination(resolvedRole, next);
      const redirectUrl = `${origin}${destination}`;
      const response = NextResponse.redirect(redirectUrl);

      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          secure: isHttps ? (options.secure ?? true) : false,
          sameSite: (options.sameSite as "lax" | "strict" | "none" | undefined) ?? "lax",
          path: options.path ?? "/",
        });
      });

      return response;
    }

    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set(
      "error",
      authOperationError || "Failed to verify authentication session. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  const loginUrl = new URL("/auth/login", origin);
  loginUrl.searchParams.set("error", "No authentication code or verification token provided.");
  return NextResponse.redirect(loginUrl);
}
