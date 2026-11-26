"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { AsapEmblem } from "@/components/brand/asap-logo";
import { resolvePostAuthDestination } from "@/lib/routing";
import {
  Search,
  Wrench,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import type { UserRole } from "@/types/database";

export interface LandingAuthCardProps {
  initialTab?: "signin" | "signup";
  className?: string;
}

export function LandingAuthCard({
  initialTab = "signup",
  className = "",
}: LandingAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirectTarget = rawRedirect && rawRedirect !== "/" ? rawRedirect : "/explore";

  const { signInWithGoogle, refreshUser } = useAuth();
  const supabase = createClient();

  const tabParam = searchParams.get("tab");
  const resolvedInitialTab = tabParam === "signin" || tabParam === "signup" ? tabParam : initialTab;
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(resolvedInitialTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [isExistingAccount, setIsExistingAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawErrorDetails, setRawErrorDetails] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check URL error messages (e.g. from OAuth callbacks)
  React.useEffect(() => {
    const errorFromUrl = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");
    if (errorFromUrl || errorDesc) {
      const msg = errorDesc || errorFromUrl || "Authentication failed. Please try again.";
      setErrorMessage(msg);
      setRawErrorDetails(msg);
    }
  }, [searchParams]);

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Friendly error translation while capturing raw Supabase message
  const mapAuthError = (err: any): string => {
    const rawMsg =
      err?.message ||
      err?.error_description ||
      (typeof err === "string" ? err : err ? JSON.stringify(err) : "Unknown error");
    
    setRawErrorDetails(rawMsg);

    if (rawMsg.includes("Invalid login credentials")) {
      return "Incorrect email/username or password. Please double-check your credentials and try again.";
    }
    if (rawMsg.includes("User already registered") || rawMsg.includes("already registered")) {
      return "An account with this email already exists. Switch to Sign In above to log in.";
    }
    if (rawMsg.includes("Database error saving new user") || rawMsg.includes("database error")) {
      return "Database error during registration. Please run the SQL migration (20261124_000004_auth_trigger_and_profiles_fix.sql) in your Supabase SQL Editor to repair the user creation trigger.";
    }
    if (rawMsg.includes("Password should be at least")) {
      return "Password must be at least 6 characters long.";
    }
    if (rawMsg.includes("valid email") || rawMsg.includes("invalid email")) {
      return "Please enter a valid email address.";
    }
    if (
      rawMsg.includes("rate limit") ||
      rawMsg.includes("over_email_send_rate_limit") ||
      rawMsg.includes("email rate limit exceeded")
    ) {
      return "Supabase email rate limit reached (max 2-3 emails/hr on default mailer). Please wait a few minutes, check your spam folder, or configure Custom SMTP in your Supabase dashboard.";
    }
    if (rawMsg.includes("Email not confirmed")) {
      return "Your email address has not been confirmed yet. Please check your inbox/spam folder, or click below to resend the confirmation email.";
    }
    return rawMsg || "Authentication failed. Please verify your details and try again.";
  };

  // Google OAuth submission
  const handleGoogleAuth = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      await signInWithGoogle(selectedRole, rawRedirect || undefined);
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
      setIsGoogleLoading(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    const targetEmail = (pendingVerificationEmail || email).trim();
    if (!targetEmail) {
      setErrorMessage("Please enter your email address to resend verification.");
      return;
    }
    if (resendCooldown > 0) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/callback?role=${selectedRole}&next=${encodeURIComponent(redirectTarget)}`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        throw error;
      }

      setResendCooldown(60);
      setSuccessMessage(`New verification link sent to ${targetEmail}! Please check your inbox and spam folder.`);
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsResending(false);
    }
  };

  // Email / Username + Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginIdentifier = email.trim();
    if (!loginIdentifier || !password) {
      setErrorMessage("Please enter both your email address (or username) and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRawErrorDetails(null);
    setSuccessMessage(null);

    try {
      let targetEmail = loginIdentifier;

      // If user provided a username instead of an email (does not contain '@')
      if (!loginIdentifier.includes("@")) {
        const cleanUsername = loginIdentifier.toLowerCase();
        // Check public.users for registered email
        const { data: userRow } = await supabase
          .from("users")
          .select("email")
          .or(`username.eq.${cleanUsername},full_name.ilike.${cleanUsername}`)
          .maybeSingle();

        if (userRow?.email) {
          targetEmail = userRow.email;
        } else {
          // Check public.profiles as fallback
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("email")
            .or(`username.eq.${cleanUsername},full_name.ilike.${cleanUsername}`)
            .maybeSingle();

          if (profileRow?.email) {
            targetEmail = profileRow.email;
          } else {
            throw new Error(
              `No account found with username "${loginIdentifier}". Please sign in with your email address.`
            );
          }
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        throw error;
      }

      await refreshUser();

      // Check role for redirection
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      const userRole = profile?.role || (data.user.user_metadata?.role as string | undefined) || "customer";
      router.push(resolvePostAuthDestination(userRole, rawRedirect));
      router.refresh();
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
      setIsLoading(false);
    }
  };

  // Email + Password + Username Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please provide a valid email and a secure password.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRawErrorDetails(null);
    setSuccessMessage(null);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/callback?role=${selectedRole}&next=${encodeURIComponent(redirectTarget)}`;

      const cleanUsername = (username.trim() || email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_");
      const cleanFullName = fullName.trim() || username.trim() || email.split("@")[0];

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo,
          data: {
            role: selectedRole,
            username: cleanUsername,
            full_name: cleanFullName,
            name: cleanFullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Detect existing user (anti-enumeration returns empty identities array):
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Attempt immediate login with the password provided
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!signInError && signInData.session) {
          // Password matched! Sign in immediately and navigate to platform
          await refreshUser();
          const { data: existingProfile } = await supabase
            .from("users")
            .select("role")
            .eq("id", signInData.user.id)
            .maybeSingle();
          const resolved = existingProfile?.role || selectedRole;
          router.push(resolvePostAuthDestination(resolved, rawRedirect));
          router.refresh();
          return;
        }

        // If password didn't match (e.g. originally signed up with Google):
        setIsExistingAccount(true);
        setErrorMessage(
          `An account with ${email.trim()} already exists. If you previously connected via Google, please click "Continue with Google" below, or enter your existing account password.`
        );
        setIsLoading(false);
        return;
      }

      // If user session is returned immediately (email confirmation disabled in Supabase)
      if (data.session) {
        await refreshUser();
        router.push(resolvePostAuthDestination(selectedRole, rawRedirect));
        router.refresh();
      } else if (data.user) {
        // Confirmation email was dispatched by Supabase
        setPendingVerificationEmail(email.trim());
        setResendCooldown(60);
        setSuccessMessage(
          `Verification email sent to ${email.trim()}. Please check your inbox (and Spam folder) to activate your account.`
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full max-w-[460px] bg-surface rounded-2xl border border-border-subtle shadow-xl shadow-accent-primary/5 p-6 sm:p-7 relative overflow-hidden backdrop-blur-sm ${className}`}
    >
      {/* Top Indigo-to-Teal-Blue brand accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-secondary via-accent-primary to-indigo-brand" />

      {/* Card Header with Emblem and Brand Name */}
      <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <AsapEmblem size={32} />
          <div>
            <h3 className="font-heading font-black text-lg text-text-primary tracking-tight leading-none">
              ASSAP Gateway
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Swift access to verified Nigerian services
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex p-1 bg-surface-subtle rounded-lg border border-border-subtle">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
              activeTab === "signin"
                ? "bg-surface text-accent-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
              activeTab === "signup"
                ? "bg-surface text-accent-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-status-danger-bg/40 border border-status-danger-border text-xs text-status-danger-text space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-status-danger-text" />
            <p className="leading-relaxed font-medium">{errorMessage}</p>
          </div>
          {rawErrorDetails && rawErrorDetails !== errorMessage && (
            <div className="pt-1.5 border-t border-status-danger-border/60">
              <span className="text-[10px] font-semibold text-status-danger-text/80 uppercase tracking-wider block">
                Backend / Supabase Error Detail:
              </span>
              <code className="text-[11px] font-mono block bg-surface/80 p-1.5 rounded border border-status-danger-border/50 text-status-danger-text mt-1 break-all">
                {rawErrorDetails}
              </code>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-status-success-bg/40 border border-status-success-border flex items-start gap-2.5 text-xs text-status-success-text">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{successMessage}</p>
        </div>
      )}

      {/* SIGN UP TAB */}
      {activeTab === "signup" && (
        <div className="mt-5 space-y-4">
          {pendingVerificationEmail ? (
            /* Dedicated Email Verification Screen */
            <div className="p-5 rounded-2xl bg-surface-subtle/50 border border-border-subtle text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-text-primary">
                  Check your inbox
                </h4>
                <p className="text-xs text-text-muted">
                  We sent an account activation link to:
                </p>
                <p className="text-xs font-bold text-text-primary bg-surface py-1 px-2.5 rounded-lg border border-border-subtle inline-block mt-1 break-all">
                  {pendingVerificationEmail}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle text-[11px] text-text-secondary text-left space-y-1.5">
                <p className="font-semibold text-text-primary flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>Didn't receive the email?</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-text-muted text-[10.5px]">
                  <li>Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.</li>
                  <li>Free mailers may take 1&ndash;2 minutes to deliver.</li>
                  <li>Click below to send a fresh confirmation link.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary-hover active:bg-accent-primary-active text-white font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-accent-primary/20"
                >
                  {isResending ? (
                    <span>Sending new link...</span>
                  ) : resendCooldown > 0 ? (
                    <span>Resend email in {resendCooldown}s</span>
                  ) : (
                    <span>Resend Verification Email</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingVerificationEmail(null);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  className="text-[11px] text-text-muted hover:text-text-primary transition-colors block mx-auto pt-1"
                >
                  Entered wrong email? Change email address
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Role Selection Picker */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Select your account type:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Customer Role */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("customer")}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.98] ${
                      selectedRole === "customer"
                        ? "border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary"
                        : "border-border-subtle bg-surface-subtle/50 hover:border-border-focus"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedRole === "customer"
                            ? "bg-accent-primary text-white"
                            : "bg-surface text-text-muted"
                        }`}
                      >
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-heading font-bold text-xs text-text-primary">
                        Customer
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5 leading-tight">
                      I need verified plumbers, cleaners, or mechanics
                    </p>
                  </button>

                  {/* Service Provider Role */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("provider")}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.98] ${
                      selectedRole === "provider"
                        ? "border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary"
                        : "border-border-subtle bg-surface-subtle/50 hover:border-border-focus"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedRole === "provider"
                            ? "bg-accent-primary text-white"
                            : "bg-surface text-text-muted"
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-heading font-bold text-xs text-text-primary">
                        Provider
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5 leading-tight">
                      I want to list my trade and get neighborhood clients
                    </p>
                  </button>
                </div>
                {selectedRole === "provider" && (
                  <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gold-pale/25 border border-gold-brushed/40 text-[10px] text-brand font-medium">
                    <Sparkles className="w-3 h-3 text-gold flex-shrink-0" />
                    <span>Includes 1st Month Free Trial (zero upfront fee).</span>
                  </div>
                )}
              </div>

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle transition-all duration-150 text-xs font-semibold text-text-primary active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isGoogleLoading
                    ? "Connecting to Google..."
                    : `Sign up as ${selectedRole === "provider" ? "Provider" : "Customer"} with Google`}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-border-subtle w-full" />
                <span className="bg-surface px-2.5 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                  or register with email
                </span>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                      Username <span className="text-text-muted font-normal">(@handle)</span>
                    </label>
                    <div className="relative">
                      <span className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5 font-bold text-xs select-none">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="e.g. ademike"
                        className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-border-subtle bg-surface-subtle/30 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                      Full / Business Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={selectedRole === "provider" ? "e.g. Ade Mechanicals" : "e.g. Ngozi Okon"}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-subtle bg-surface-subtle/30 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-subtle bg-surface-subtle/30 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-border-subtle bg-surface-subtle/30 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Inline Error & Action Alert directly above button */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-status-danger-bg/70 border-2 border-status-danger-border text-xs text-status-danger-text space-y-2.5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-status-danger-text" />
                      <div className="space-y-1">
                        <p className="font-semibold leading-relaxed">{errorMessage}</p>
                        {isExistingAccount && (
                          <div className="pt-2 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={handleGoogleAuth}
                              disabled={isGoogleLoading}
                              className="w-full py-2 px-3 rounded-lg bg-surface border border-border-subtle hover:bg-surface-subtle font-semibold text-xs text-text-primary flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                            >
                              <span>👉 Continue with Google ({email})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab("signin");
                                setErrorMessage(null);
                                setIsExistingAccount(false);
                              }}
                              className="w-full py-2 px-3 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold text-xs flex items-center justify-center shadow-sm active:scale-[0.98]"
                            >
                              <span>👉 Switch to Sign In Tab</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary-hover active:bg-accent-primary-active text-white font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-accent-primary/20"
                >
                  <span>{isLoading ? "Creating Account..." : "Create Account & Enter Platform"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <p className="text-[10px] text-text-muted text-center leading-relaxed pt-1">
                By signing up, you agree to ASSAP&apos;s verified local directory terms. 100% free for customers; 30-day free trial for service providers.
              </p>
            </>
          )}
        </div>
      )}

      {/* SIGN IN TAB */}
      {activeTab === "signin" && (
        <div className="mt-5 space-y-4">
          {/* Unconfirmed email banner */}
          {errorMessage && errorMessage.includes("not been confirmed") && (
            <div className="p-3 rounded-xl bg-surface-subtle/60 border border-accent-secondary/30 text-xs text-brand space-y-2">
              <p className="leading-relaxed">
                Need a new verification link sent to <strong>{email || "your email"}</strong>?
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending || resendCooldown > 0}
                className="py-1.5 px-3 rounded-lg bg-accent-primary text-white text-[11px] font-semibold hover:bg-accent-primary-hover active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isResending ? "Sending..." : resendCooldown > 0 ? `Wait ${resendCooldown}s` : "Resend Verification Email"}
              </button>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle transition-all duration-150 text-xs font-semibold text-text-primary active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-border-subtle w-full" />
            <span className="bg-surface px-2.5 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              or sign in with password
            </span>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com or @username"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-subtle bg-surface-subtle/30 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-border-subtle bg-surface-subtle/30 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary-hover active:bg-accent-primary-active text-white font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-accent-primary/20"
            >
              <span>{isLoading ? "Signing in..." : "Sign In & Continue"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-accent-primary hover:underline font-medium"
            >
              Don't have an account yet? Create one for free
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
