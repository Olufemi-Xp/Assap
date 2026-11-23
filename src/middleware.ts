import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isRoot = pathname === "/";
  const isExplorePath = pathname === "/explore" || pathname.startsWith("/explore/");
  const isProvidersPath = pathname.startsWith("/providers");
  const isAppPath = pathname === "/app" || pathname.startsWith("/app/");
  const isProviderPath = pathname.startsWith("/provider");
  const isAdminPath = pathname.startsWith("/admin");
  const isProfilePath = pathname.startsWith("/profile");
  const isOnboardingPath = pathname.startsWith("/onboarding");

  const isProtectedPath =
    isExplorePath ||
    isProvidersPath ||
    isAppPath ||
    isProviderPath ||
    isAdminPath ||
    isProfilePath ||
    isOnboardingPath;

  // 1. If an authenticated user visits the landing root (/), redirect them into the platform
  if (isRoot && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "provider") {
      return NextResponse.redirect(new URL("/provider/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/explore", request.url));
  }

  // 2. If an unauthenticated visitor tries to access protected platform modules, redirect to root landing gateway
  if (isProtectedPath && !user) {
    const landingUrl = new URL("/", request.url);
    landingUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(landingUrl);
  }

  // 3. If an authenticated user is accessing /admin, verify admin role
  if (isAdminPath && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/explore", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/explore/:path*",
    "/explore",
    "/providers/:path*",
    "/app/:path*",
    "/app",
    "/provider/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
  ],
};
