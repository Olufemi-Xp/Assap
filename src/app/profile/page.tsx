"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { User, LogOut, ArrowRight, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { user, role, signOut, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-[500px] mx-auto py-12 text-center text-xs text-text-muted">
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

  const isProvider = role === "provider";

  return (
    <AppShell>
      <div className="max-w-[520px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Account settings</h1>
          <p className="text-xs text-text-secondary mt-1">Manage your identity and session preferences.</p>
        </div>

        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-heading font-bold text-base text-text-primary">
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
              </p>
              <p className="text-xs text-text-muted">{user.email}</p>
            </div>
          </div>

          <div className="divide-y divide-border-subtle text-xs border-y border-border-subtle">
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Account role</span>
              <span className="font-semibold text-text-primary capitalize">{role || "Customer"}</span>
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
                {user.app_metadata?.provider === "google" ? "Google OAuth" : "Email OTP"}
              </span>
            </div>
          </div>

          {isProvider && (
            <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle space-y-2">
              <p className="text-xs font-semibold text-text-primary">Service Provider Hub</p>
              <p className="text-[11px] text-text-secondary">
                Manage your public trade profile, rating reviews, and ₦1,000 monthly Paystack subscription.
              </p>
              <Link href="/provider/dashboard" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                  Open Provider Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}

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
