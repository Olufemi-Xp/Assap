"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { AsapEmblem } from "@/components/brand/asap-logo";
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
  const redirectTarget = searchParams.get("redirect") || "/explore";

  const { signInWithGoogle, refreshUser } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Friendly error translation
  const mapAuthError = (err: any): string => {
    const msg = err?.message || "";
    if (msg.includes("Invalid login credentials")) {
      return "Incorrect email or password. Please double-check and try again.";
    }
    if (msg.includes("User already registered") || msg.includes("already registered")) {
      return "An account with this email already exists. Switch to Sign In above.";
    }
    if (msg.includes("Password should be at least")) {
      return "Password must be at least 6 characters long.";
    }
    if (msg.includes("valid email")) {
      return "Please enter a valid email address.";
    }
    if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) {
      return "Too many attempts in a short time. Please wait a minute before retrying.";
    }
    return msg || "Authentication failed. Please verify your details and try again.";
  };

  // Google OAuth submission
  const handleGoogleAuth = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      await signInWithGoogle(selectedRole, redirectTarget);
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
      setIsGoogleLoading(false);
    }
  };

  // Email + Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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
        .single();

      const userRole = profile?.role || "customer";

      if (userRole === "provider") {
        const { data: providerProfile } = await supabase
          .from("provider_profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (!providerProfile) {
          router.push("/onboarding/kyc-capture?role=provider");
        } else {
          router.push("/provider/dashboard");
        }
      } else {
        router.push(redirectTarget);
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
      setIsLoading(false);
    }
  };

  // Email + Password Sign Up
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
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: selectedRole,
            full_name: fullName.trim() || email.split("@")[0],
          },
        },
      });

      if (error) {
        throw error;
      }

      // If user session is returned immediately (email confirmation disabled or auto-confirmed)
      if (data.session) {
        await refreshUser();
        if (selectedRole === "provider") {
          router.push("/onboarding/kyc-capture?role=provider");
        } else {
          router.push(redirectTarget);
        }
        router.refresh();
      } else if (data.user) {
        // Confirmation email was dispatched
        setSuccessMessage(
          `Confirmation link sent to ${email.trim()}. Please open your inbox to activate your account.`
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
      {/* Top subtle emerald brand accent gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-primary via-emerald-400 to-amber-400" />

      {/* Card Header with Emblem and Brand Name */}
      <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <AsapEmblem size={32} />
          <div>
            <h3 className="font-heading font-black text-lg text-text-primary tracking-tight leading-none">
              ASAP Gateway
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
        <div className="mt-4 p-3 rounded-xl bg-status-danger-bg/40 border border-status-danger-border flex items-start gap-2.5 text-xs text-status-danger-text">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{errorMessage}</p>
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
              <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
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
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Full Name or Business Name
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
            By signing up, you agree to ASAP's verified local directory terms. 100% free for customers; 30-day free trial for service providers.
          </p>
        </div>
      )}

      {/* SIGN IN TAB */}
      {activeTab === "signin" && (
        <div className="mt-5 space-y-4">
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
