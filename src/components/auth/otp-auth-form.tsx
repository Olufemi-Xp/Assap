"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import type { UserRole } from "@/types/database";

export interface OtpAuthFormProps {
  mode: "signup" | "login";
  defaultRole?: UserRole;
}

export function OtpAuthForm({ mode, defaultRole = "customer" }: OtpAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") as UserRole) || defaultRole;
  const redirectParam = searchParams.get("redirect") || "/explore";

  const { signInWithGoogle, refreshUser } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [role, setRole] = useState<UserRole>(roleParam);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check URL error messages
  useEffect(() => {
    const errorFromUrl = searchParams.get("error");
    if (errorFromUrl) {
      setError(errorFromUrl);
    }
  }, [searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const destination = mode === "signup" && role === "provider" 
        ? "/onboarding/kyc-capture?role=provider" 
        : redirectParam;
      await signInWithGoogle(role, destination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign in failed. Please check configuration.");
      setIsGoogleLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          data: {
            role,
            full_name: fullName.trim() || email.split("@")[0],
          },
          emailRedirectTo: `${origin}/auth/callback?role=${role}`,
        },
      });

      if (otpError) {
        throw otpError;
      }

      setStep("otp");
      setResendCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send code";
      setError(msg.includes("rate limit") ? "Too many requests. Please wait a minute before requesting another code." : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resendErr } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${origin}/auth/callback?role=${role}`,
        },
      });
      if (resendErr) throw resendErr;
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (otp.trim().length !== 6) {
        throw new Error("Enter the six-digit code sent to your email.");
      }

      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "email",
      });

      if (verifyErr || !data.user) {
        throw new Error(verifyErr?.message || "Invalid or expired verification code.");
      }

      // Upsert public user profile record
      await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName.trim() || data.user.email!.split("@")[0],
        role,
        email_verified_at: new Date().toISOString(),
      });

      await refreshUser();

      // Route based on role and mode
      if (mode === "signup" && role === "provider") {
        router.push(`/onboarding/kyc-capture?role=provider&email=${encodeURIComponent(email)}`);
      } else if (role === "provider") {
        router.push("/provider/dashboard");
      } else {
        router.push(redirectParam);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed. Check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-[440px] w-full mx-auto p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold text-text-primary">
          {mode === "signup" ? "Create your account" : "Sign in to ASSAP"}
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          {step === "email"
            ? "Sign in with Google or use email verification."
            : `Enter the six-digit code sent to ${email}.`}
        </p>
      </div>

      {mode === "signup" && step === "email" && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-text-muted">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`p-3 rounded-lg border text-xs font-medium text-center transition-colors ${
                role === "customer"
                  ? "border-accent-primary bg-accent-primary text-text-inverted"
                  : "border-border-subtle bg-surface text-text-secondary hover:bg-surface-hover"
              }`}
            >
              Find local services
            </button>
            <button
              type="button"
              onClick={() => setRole("provider")}
              className={`p-3 rounded-lg border text-xs font-medium text-center transition-colors ${
                role === "provider"
                  ? "border-accent-primary bg-accent-primary text-text-inverted"
                  : "border-border-subtle bg-surface text-text-secondary hover:bg-surface-hover"
              }`}
            >
              Offer trades & services
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs border border-red-200 dark:border-red-900 leading-relaxed">
          {error}
        </div>
      )}

      {step === "email" ? (
        <div className="space-y-4">
          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2.5 font-medium border-border-subtle hover:bg-surface-subtle"
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-border-subtle w-full" />
            <span className="bg-surface px-2 text-[11px] text-text-muted absolute uppercase tracking-wider">
              or with email
            </span>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            {mode === "signup" && (
              <Input
                label="Full name"
                placeholder="e.g. Babatunde Adeleke"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="We will send a 6-digit confirmation code."
            />
            <Button type="submit" className="w-full font-medium" isLoading={isLoading}>
              Send verification code
            </Button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="Six-digit code"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
            className="text-center font-mono text-xl tracking-widest"
          />
          <Button type="submit" className="w-full font-medium" isLoading={isLoading}>
            Verify and continue
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-text-muted hover:text-text-primary"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className="text-accent-primary font-medium disabled:text-text-muted disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
