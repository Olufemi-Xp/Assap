import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getHomeRouteForRole, isProviderOnlyPath } from "@/lib/routing";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const host = forwardedHost || request.nextUrl.host;
  const origin = `${forwardedProto}://${host}`;
  const isHttps = forwardedProto === "https";

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
            response.cookies.set(name, value, {
              ...options,
              secure: isHttps ? (options.secure ?? true) : false,
              sameSite: (options.sameSite as "lax" | "strict" | "none" | undefined) ?? "lax",
              path: options.path ?? "/",
            })
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
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";
  const isExplorePath = pathname === "/explore" || pathname.startsWith("/explore/");
  const isProvidersPath = pathname.startsWith("/providers");
  const isAppPath = pathname === "/app" || pathname.startsWith("/app/");
  const isProviderPath = isProviderOnlyPath(pathname);
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

  const createRedirect = (targetPathOrUrl: string) => {
    const url =
      targetPathOrUrl.startsWith("http://") || targetPathOrUrl.startsWith("https://")
        ? targetPathOrUrl
        : `${origin}${targetPathOrUrl.startsWith("/") ? targetPathOrUrl : `/${targetPathOrUrl}`}`;

    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
        secure: isHttps ? (cookie.secure ?? true) : false,
        sameSite: "lax",
        path: "/",
      });
    });
    return redirectResponse;
  };

  let userRole: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    userRole = profile?.role || (user.user_metadata?.role as string | undefined) || "customer";
  }

  // 1. Authenticated users visiting / or auth pages go to their role-based home
  //    (unless explicitly navigating to the Welcome Page via /?welcome=1)
  const stayOnWelcome = isRoot && request.nextUrl.searchParams.get("welcome") === "1";
  if ((isRoot || isAuthPage) && user && !stayOnWelcome) {
    return createRedirect(getHomeRouteForRole(userRole));
  }

  // 2. Unauthenticated visitors on protected routes go directly to Sign In / Sign Up
  if (isProtectedPath && !user) {
    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set("redirect", pathname);
    return createRedirect(loginUrl.toString());
  }

  // 3. Role guards for /admin and /provider/*
  if (isAdminPath && user && userRole !== "admin") {
    return createRedirect(getHomeRouteForRole(userRole));
  }

  if (isProviderPath && user && userRole !== "provider" && userRole !== "admin") {
    return createRedirect("/explore");
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/auth/login",
    "/auth/signup",
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
