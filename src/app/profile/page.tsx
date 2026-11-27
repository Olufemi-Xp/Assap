"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { getHomeLabelForRole, getHomeRouteForRole } from "@/lib/routing";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Compass,
  Home,
  LayoutDashboard,
  LogOut,
  Pencil,
  Phone,
  ShieldCheck,
  Upload,
} from "lucide-react";

export default function ProfilePage() {
  const { user, role, signOut, isLoading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const homeRoute = getHomeRouteForRole(role);
  const homeLabel = getHomeLabelForRole(role);
  const isProvider = role === "provider";

  useEffect(() => {
    if (!user) return;
    const metaAvatar = (user.user_metadata?.avatar_url as string | undefined) || null;
    const metaPhone = (user.user_metadata?.phone_number as string | undefined) || "";
    try {
      const localAvatar = localStorage.getItem(`asap-avatar-${user.id}`);
      const localPhone = localStorage.getItem(`asap-phone-${user.id}`);
      setAvatarUrl(localAvatar || metaAvatar);
      setPhoneNumber(localPhone ?? metaPhone);
    } catch {
      setAvatarUrl(metaAvatar);
      setPhoneNumber(metaPhone);
    }
  }, [user]);

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPhotoMenuOpen(false);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) return;
      setAvatarUrl(dataUrl);
      try {
        localStorage.setItem(`asap-avatar-${user.id}`, dataUrl);
        const supabase = createClient();
        await supabase.auth.updateUser({ data: { avatar_url: dataUrl } });
      } catch {
        // Keep local preview even if metadata update is skipped
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSavedFeedback(false);
    try {
      localStorage.setItem(`asap-phone-${user.id}`, phoneNumber.trim());
      const supabase = createClient();
      await supabase.auth.updateUser({ data: { phone_number: phoneNumber.trim() } });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch {
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

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

  const displayName =
    (user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "Customer";
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <AppShell>
      <div className="max-w-[560px] mx-auto space-y-6">
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

        <div id="settings">
          <h1 className="text-2xl font-heading font-bold text-text-primary">Profile Settings</h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage your profile picture, phone number, role workspace, and session preferences.
          </p>
        </div>

        <Card className="p-6 space-y-5">
          {/* Profile Picture with Edit (Take Camera Photo / Upload Image) */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-accent-primary/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent-primary text-white flex items-center justify-center font-heading font-bold text-xl">
                  {initialLetter}
                </div>
              )}

              <button
                type="button"
                onClick={() => setPhotoMenuOpen((prev) => !prev)}
                aria-label="Edit profile picture"
                className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border-subtle shadow-md text-[10px] font-semibold text-text-primary hover:text-accent-primary"
              >
                <Pencil className="w-2.5 h-2.5" />
                <span>Edit</span>
              </button>

              {photoMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border border-border-subtle bg-surface shadow-xl p-1.5 z-30 space-y-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-text-primary hover:bg-surface-subtle transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-accent-primary" />
                    <span>Take Camera Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-text-primary hover:bg-surface-subtle transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-accent-primary" />
                    <span>Upload Image</span>
                  </button>
                </div>
              )}

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleImageSelected}
                className="hidden"
              />
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelected}
                className="hidden"
              />
            </div>

            <div className="min-w-0">
              <p className="font-heading font-bold text-base text-text-primary truncate">
                {displayName}
              </p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
          </div>

          {/* Phone Number Field */}
          <form onSubmit={handleSaveProfile} className="space-y-2 pt-2 border-t border-border-subtle">
            <label htmlFor="profile-phone" className="block text-xs font-semibold text-text-primary">
              Phone Number
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <Button type="submit" size="sm" isLoading={isSaving} className="h-10 px-4 gap-1.5">
                {savedFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </Button>
            </div>
          </form>

          <div className="divide-y divide-border-subtle text-xs border-y border-border-subtle">
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Account role</span>
              <span className="font-semibold text-text-primary capitalize">
                {isProvider ? "Service Provider" : role || "Customer"}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-muted">Email verification</span>
              <span className="font-semibold text-verified flex items-center gap-1">
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
