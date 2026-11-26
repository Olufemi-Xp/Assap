"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Home,
  LayoutDashboard,
  Compass,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { AsapLogo } from "@/components/brand/asap-logo";
import { getHomeLabelForRole, getHomeRouteForRole } from "@/lib/routing";

export function TopNav() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const { user, role, signOut, isLoading } = useAuth();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const homeHref = user ? getHomeRouteForRole(role) : "/";
  const homeLabel = getHomeLabelForRole(role);
  const isProvider = role === "provider";
  const isHomeActive = isProvider
    ? pathname.startsWith("/provider")
    : pathname === "/explore";
  const isExploreActive = pathname.startsWith("/explore") || pathname.startsWith("/providers");

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Profile";

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur border-b border-border-subtle">
      <div className="max-w-[1200px] h-16 mx-auto px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Brand -> role-aware Home / Dashboard */}
        <Link href={homeHref} className="flex items-center min-h-tap flex-shrink-0 group">
          <AsapLogo variant="horizontal" size="sm" showTagline={false} />
        </Link>

        {/* Primary Persistent Navigation */}
        <nav aria-label="Primary navigation" className="flex items-center gap-1 sm:gap-2">
          {user && (
            <>
              <Link
                href={homeHref}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors min-h-tap flex items-center gap-1.5 ${
                  isHomeActive
                    ? "text-accent-primary font-semibold bg-accent-primary/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                }`}
              >
                {isProvider ? (
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Home className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{homeLabel}</span>
              </Link>

              <Link
                href="/explore"
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors min-h-tap flex items-center gap-1.5 ${
                  isExploreActive && (isProvider || !isHomeActive)
                    ? "text-accent-primary font-semibold bg-accent-primary/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                }`}
              >
                <Compass className="w-4 h-4 flex-shrink-0" />
                <span>Explore</span>
              </Link>
            </>
          )}

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 border-l border-border-subtle">
                  <Link
                    href="/profile"
                    aria-label="Open profile"
                    className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors min-h-tap flex items-center gap-1.5 ${
                      pathname.startsWith("/profile")
                        ? "text-accent-primary font-semibold bg-accent-primary/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-accent-primary/15 text-accent-primary flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="max-w-[96px] truncate hidden md:inline">{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    title="Sign Out"
                    aria-label="Sign out"
                    className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors min-h-tap flex items-center gap-1 text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
                  <Link
                    href="/auth/login"
                    className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-accent-primary text-white hover:bg-accent-primary-hover transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors min-h-tap min-w-tap flex items-center justify-center"
          >
            {isDark ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
