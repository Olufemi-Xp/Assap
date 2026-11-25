"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CustomerNavPane } from "@/components/layout/customer-nav-pane";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { getHomeLabelForRole, getHomeRouteForRole } from "@/lib/routing";
import {
  User,
  LogOut,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Compass,
  LayoutDashboard,
  Home,
} from "lucide-react";

export default function ProfilePage() {
  const { user, role, signOut, isLoading } = useAuth();

  const homeRoute = getHomeRouteForRole(role);
  const homeLabel = getHomeLabelForRole(role);
  const isProvider = role === "provider";

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-[520px] mx-auto py-12 text-center text-xs text-text-muted">
          Loading account profile...
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-[440px] mx-auto py-16 text-center space-y-4">
          <h1 className="text-xl font-heading font-bold text-text-primary">Sign in required</h1>
          <p className="text-xs text-text-secondary">
            You must be signed in to view and manage your account details.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">Sign In</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CustomerNavPane />
      <div className="max-w-[560px] mx-auto space-y-6 pb-24 lg:pb-6">
        {/* Explicit Back to Dashboard / Home Escape Hatch */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={homeRoute}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {isProvider ? "Provider Dashboard" : "Home"}</span>
            </Button>
          </Link>

          <Link href="/explore">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Services</span>
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Account Settings</h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage your identity, role workspace, and session preferences.
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-base text-text-primary truncate">
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
              </p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
          </div>

          <div className="divide-y divide-border-subtle text-xs border-y border-border-subtle">
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Account role</span>
              <span className="font-semibold text-text-primary capitalize">
                {isProvider ? "Service Provider" : role || "Customer"}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Email verification</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Auth method</span>
              <span className="font-mono text-text-primary">
                {user.app_metadata?.provider === "google" ? "Google OAuth" : "Email & Password"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle space-y-2">
            <p className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              {isProvider ? (
                <LayoutDashboard className="w-3.5 h-3.5 text-accent-primary" />
              ) : (
                <Home className="w-3.5 h-3.5 text-accent-primary" />
              )}
              <span>{isProvider ? "Service Provider Hub" : "Customer Discovery"}</span>
            </p>
            <p className="text-[11px] text-text-secondary">
              {isProvider
                ? "Manage your portfolio, public trade profile, reviews, and ₦1,000 monthly Paystack subscription."
                : "Set your State, City, and Local Government to browse verified tradespeople near you."}
            </p>
            <Link href={homeRoute} className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                <span>Go to {homeLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 text-red-600 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
