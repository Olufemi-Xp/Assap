"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AsapEmblem, AsapLogo } from "@/components/brand/asap-logo";
import { getHomeLabelForRole, getHomeRouteForRole } from "@/lib/routing";
import {
  Home,
  LayoutDashboard,
  Compass,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Wrench,
  CreditCard,
  Menu,
  X,
  Settings,
} from "lucide-react";

const SIDEBAR_STORAGE_KEY = "asap-sidebar-collapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, role, signOut, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "true") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  // Close mobile drawer & popover menu when route changes
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close popover menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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

  const isProvider = role === "provider";
  const homeHref = user ? getHomeRouteForRole(role) : "/";
  const homeLabel = getHomeLabelForRole(role);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Profile";

  const navItems = [
    {
      href: homeHref,
      label: isProvider ? "Dashboard" : homeLabel,
      icon: isProvider ? LayoutDashboard : Home,
      active: isProvider ? pathname === "/provider/dashboard" : pathname === "/explore",
      show: Boolean(user),
    },
    {
      href: "/explore",
      label: "Explore",
      icon: Compass,
      active:
        (pathname.startsWith("/explore") || pathname.startsWith("/providers")) &&
        (isProvider || pathname.startsWith("/providers")),
      show: Boolean(user) && isProvider, // For customers, Home is /explore; add direct Explore for providers
    },
    {
      href: "/provider/subscription",
      label: "Subscription",
      icon: CreditCard,
      active: pathname.startsWith("/provider/subscription"),
      show: Boolean(user) && isProvider,
    },
    {
      href: "/onboarding/kyc-capture?role=provider",
      label: isProvider ? "Identity & KYC" : "Become a Provider",
      icon: Wrench,
      active: pathname.startsWith("/onboarding"),
      show: Boolean(user),
    },
  ].filter((item) => item.show);

  const renderSidebarBody = (isMobileDrawer = false) => {
    const isCompact = !isMobileDrawer && collapsed;

    return (
      <div className="flex flex-col h-full bg-surface border-r border-border-subtle select-none">
        {/* Top Brand + Collapse Button */}
        <div
          className={`h-16 flex items-center border-b border-border-subtle px-3 ${
            isCompact ? "justify-center" : "justify-between"
          }`}
        >
          <Link href={homeHref} className="flex items-center min-w-0">
            {isCompact ? (
              <AsapEmblem size={30} />
            ) : (
              <AsapLogo variant="horizontal" size="sm" showTagline={false} />
            )}
          </Link>

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapsed}
              title={isCompact ? "Expand navigation" : "Collapse navigation"}
              aria-label={isCompact ? "Expand navigation" : "Collapse navigation"}
              className={`p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors ${
                isCompact ? "hidden" : ""
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCompact && (
          <div className="flex justify-center pt-3 pb-1">
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Expand navigation"
              aria-label="Expand navigation"
              className="p-2 rounded-xl text-text-secondary hover:text-accent-primary hover:bg-surface-subtle transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav aria-label="App navigation" className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                title={isCompact ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-tap ${
                  isCompact ? "justify-center px-0" : ""
                } ${
                  item.active
                    ? "bg-accent-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCompact && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Single Customer Initial Circle Button + Popover Menu */}
        <div className="p-3 border-t border-border-subtle">
          {!isLoading && user ? (
            <div ref={menuRef} className={`relative flex ${isCompact ? "justify-center" : "justify-start"}`}>
              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Account menu"
                  className="absolute bottom-full mb-2 left-0 w-60 rounded-2xl border border-border-subtle bg-surface shadow-2xl overflow-hidden z-50"
                >
                  {/* Top: Static Customer Name & Email (non-interactive) */}
                  <div className="px-4 py-3 border-b border-border-subtle select-text">
                    <p className="font-heading font-bold text-sm text-text-primary truncate">
                      {displayName}
                    </p>
                    {user.email && (
                      <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                    )}
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/profile#settings"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
                    >
                      <Settings className="w-4 h-4 text-accent-primary flex-shrink-0" />
                      <span>Settings</span>
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        {isDark ? (
                          <Sun className="w-4 h-4 text-gold flex-shrink-0" />
                        ) : (
                          <Moon className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                      </span>
                      <span
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                          isDark ? "bg-accent-primary justify-end" : "bg-border-subtle justify-start"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-white shadow-sm" />
                      </span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label={`${displayName} account menu`}
                title={displayName}
                className="w-11 h-11 rounded-full bg-accent-primary hover:bg-accent-primary-hover text-white font-heading font-bold text-base flex items-center justify-center shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
              >
                {displayName.charAt(0).toUpperCase()}
              </button>
            </div>
          ) : !isLoading ? (
            <Link
              href="/auth/login"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold bg-accent-primary text-white hover:bg-accent-primary-hover transition-colors min-h-tap ${
                isCompact ? "justify-center px-0" : ""
              }`}
            >
              <UserIcon className="w-4 h-4 flex-shrink-0" />
              {!isCompact && <span>Sign In</span>}
            </Link>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Trigger (visible only on small screens where sidebar is tucked away) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="md:hidden fixed top-3.5 left-3.5 z-40 p-2.5 rounded-xl bg-surface/95 backdrop-blur border border-border-subtle shadow-md text-text-primary hover:text-accent-primary"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            {renderSidebarBody(true)}
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar */}
      <aside
        aria-label="Application Sidebar"
        className={`hidden md:block flex-shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${
          collapsed ? "w-[72px]" : "w-[232px]"
        }`}
      >
        {renderSidebarBody(false)}
      </aside>
    </>
  );
}
