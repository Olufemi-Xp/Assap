"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Home,
  Sparkles,
  User as UserIcon,
  LogOut,
  PanelLeft,
  PanelRight,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from "lucide-react";

type DockSide = "left" | "right";

const DOCK_STORAGE_KEY = "asap-customer-nav-dock";

export function CustomerNavPane() {
  const pathname = usePathname();
  const { role, signOut } = useAuth();
  const [dockSide, setDockSide] = useState<DockSide>("left");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DOCK_STORAGE_KEY);
      if (saved === "left" || saved === "right") {
        setDockSide(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleDockSide = () => {
    const next: DockSide = dockSide === "left" ? "right" : "left";
    setDockSide(next);
    try {
      localStorage.setItem(DOCK_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  };

  // Only show customer navigation pane for customers (or when role isn't provider)
  if (role === "provider") return null;

  const isDashboard = pathname === "/explore";
  const isProfile = pathname.startsWith("/profile");

  const sidePositionClass =
    dockSide === "left" ? "lg:left-4 lg:right-auto" : "lg:right-4 lg:left-auto";

  return (
    <aside
      aria-label="Customer Navigation Pane"
      className={`fixed bottom-4 left-4 right-4 lg:bottom-auto lg:top-24 z-30 ${sidePositionClass} transition-all duration-200`}
    >
      <div
        className={`bg-surface/95 backdrop-blur-md border border-border-subtle rounded-2xl shadow-lg shadow-black/5 ${
          collapsed ? "p-2 w-auto inline-flex items-center gap-1" : "p-3 lg:w-52 space-y-2"
        }`}
      >
        {/* Pane Header: Dock Left/Right + Collapse/Expand */}
        <div
          className={`flex items-center justify-between gap-2 ${
            collapsed ? "" : "pb-2 border-b border-border-subtle"
          }`}
        >
          {!collapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1">
              Navigation
            </span>
          )}

          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={toggleDockSide}
              title={`Dock to ${dockSide === "left" ? "Right" : "Left"} side`}
              aria-label={`Dock navigation pane to ${dockSide === "left" ? "right" : "left"} side`}
              className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-text-secondary hover:text-accent-primary hover:bg-surface-subtle transition-colors"
            >
              {dockSide === "left" ? (
                <>
                  <PanelRight className="w-3.5 h-3.5" />
                  {!collapsed && <span>Right</span>}
                </>
              ) : (
                <>
                  <PanelLeft className="w-3.5 h-3.5" />
                  {!collapsed && <span>Left</span>}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand navigation pane" : "Collapse navigation pane"}
              aria-label={collapsed ? "Expand navigation pane" : "Collapse navigation pane"}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              {collapsed ? (
                dockSide === "left" ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )
              ) : dockSide === "left" ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Actions */}
        {!collapsed && (
          <nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1.5">
            <Link
              href="/explore"
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isDashboard
                  ? "bg-accent-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
              }`}
            >
              <Home className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Home / Dashboard</span>
            </Link>

            <Link
              href="/?welcome=1"
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-gold" />
              <span>Welcome Page</span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isProfile
                  ? "bg-accent-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>My Profile</span>
            </Link>

            <Link
              href="/onboarding/kyc-capture?role=provider"
              className="hidden lg:flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 flex-shrink-0 text-accent-primary" />
              <span>Become a Provider</span>
            </Link>

            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </nav>
        )}
      </div>
    </aside>
  );
}
