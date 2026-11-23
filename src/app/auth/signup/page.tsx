import { Suspense } from "react";
import Link from "next/link";
import { AsapLogo } from "@/components/brand/asap-logo";
import { LandingAuthCard } from "@/components/auth/landing-auth-card";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-canvas">
      <div className="mb-6">
        <Link href="/">
          <AsapLogo variant="horizontal" size="md" showTagline={true} />
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="w-full max-w-[460px] h-[520px] rounded-2xl bg-surface border border-border-subtle animate-pulse" />
        }
      >
        <LandingAuthCard initialTab="signup" />
      </Suspense>
    </div>
  );
}
