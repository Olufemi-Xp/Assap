"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sun, Moon, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { AsapLogo } from "@/components/brand/asap-logo";

export function TopNav() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const { user, role, signOut, isLoading } = useAuth();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
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

  const homeHref = user ? "/explore" : "/";

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-surface/95 backdrop-blur border-b border-border-subtle">
      <div className="max-w-[1200px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <Link href={homeHref} className="flex items-center min-h-tap flex-shrink-0 group">
          <AsapLogo variant="horizontal" size="sm" showTagline={false} />
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/explore"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors min-h-tap flex items-center ${
              pathname.startsWith("/explore")
                ? "text-accent-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Find Services
          </Link>

          {role === "provider" ? (
            <Link
              href="/provider/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors min-h-tap flex items-center ${
                pathname.startsWith("/provider")
                  ? "text-accent-primary font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Provider Hub
            </Link>
          ) : (
            <Link
              href="/onboarding/kyc-capture"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors min-h-tap flex items-center hidden sm:flex ${
                pathname.startsWith("/onboarding")
                  ? "text-accent-primary font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Join as Provider
            </Link>
          )}

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l border-border-subtle">
                  <Link
                    href="/profile"
                    className={`px-2.5 py-1.5 rounded-lg text-sm transition-colors min-h-tap flex items-center gap-1.5 ${
                      pathname === "/profile"
                        ? "text-accent-primary font-semibold bg-accent-primary/10"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="max-w-[100px] truncate hidden md:inline">
                      {user.email?.split("@")[0] || "Account"}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    title="Sign Out"
                    aria-label="Sign out"
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50/10 transition-colors flex items-center gap-1 text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
                  <Link
                    href="/?tab=signin"
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-accent-primary hover:bg-accent-primary/10 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors min-h-tap min-w-tap flex items-center justify-center ml-1"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
