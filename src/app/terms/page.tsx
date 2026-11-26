import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AsapLogo } from "@/components/brand/asap-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary">
      <header className="sticky top-0 z-40 w-full bg-canvas/95 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center min-h-tap">
            <AsapLogo variant="horizontal" size="md" showTagline={true} />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-accent-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-brand tracking-tight">
            Terms &amp; Policy
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            ASSAP connects customers directly with local tradespeople across Nigeria with zero middleman fees.
          </p>
        </div>

        <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
          <section className="p-6 rounded-2xl border border-border-subtle bg-surface space-y-2">
            <h2 className="font-heading font-bold text-base text-brand">1. Platform Usage</h2>
            <p>
              Customers use ASSAP completely free of charge to discover and contact verified artisans. Service
              providers receive a 30-day initial free trial followed by a predictable &#8358;1,000/month subscription
              and retain 100% of their labor earnings.
            </p>
          </section>

          <section className="p-6 rounded-2xl border border-border-subtle bg-surface space-y-2">
            <h2 className="font-heading font-bold text-base text-brand">2. Verification &amp; Privacy</h2>
            <p>
              Provider KYC details are collected solely to verify identity and uphold platform trust. Contact details
              are displayed only for active, verified provider profiles.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
