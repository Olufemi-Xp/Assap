/**
 * Centralised, dependency-free routing helpers shared by middleware (edge),
 * route handlers, server components and client components.
 */

export type AppRole = "customer" | "provider" | "admin";

/** Where a signed-in user should land when they press "Home" / "Dashboard". */
export function getHomeRouteForRole(role?: string | null): string {
  if (role === "provider") return "/provider/dashboard";
  if (role === "admin") return "/admin";
  return "/explore";
}

/** Human label for the role-aware Home button. */
export function getHomeLabelForRole(role?: string | null): string {
  if (role === "provider") return "Dashboard";
  if (role === "admin") return "Admin";
  return "Home";
}

/** Paths that only service providers may open. */
export function isProviderOnlyPath(pathname: string): boolean {
  return pathname === "/provider" || pathname.startsWith("/provider/");
}

/**
 * Accepts only same-origin relative paths to prevent open redirects.
 * Returns null for anything unsafe or pointless (root and auth pages).
 */
export function sanitizeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (value === "/" || value.startsWith("/auth")) return null;
  return value;
}

/**
 * Final post-authentication destination for a user.
 * Providers always go to their dashboard (which handles incomplete setup);
 * customers go to the requested page, or Explore by default.
 */
export function resolvePostAuthDestination(role: string | null | undefined, requested?: string | null): string {
  const home = getHomeRouteForRole(role);
  if (role === "provider" || role === "admin") return home;
  const safe = sanitizeRedirectPath(requested);
  if (!safe || isProviderOnlyPath(safe) || safe.startsWith("/admin")) return home;
  return safe;
}
