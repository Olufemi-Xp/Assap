import React, { Suspense } from "react";
import Link from "next/link";
import { AsapLogo, AsapEmblem } from "@/components/brand/asap-logo";
import { LandingAuthCard } from "@/components/auth/landing-auth-card";
import {
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle,
  Wrench,
  Search,
  BadgeCheck,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const featuredTrades = [
    { name: "Plumbing", query: "plumber", count: "1,240+ verified" },
    { name: "Electrical", query: "electrician", count: "980+ verified" },
    { name: "Carpentry", query: "carpenter", count: "650+ verified" },
    { name: "Cleaning", query: "cleaner", count: "820+ verified" },
    { name: "Auto Mechanics", query: "mechanic", count: "540+ verified" },
    { name: "Generator Repair", query: "generator", count: "490+ verified" },
    { name: "Painting", query: "painter", count: "410+ verified" },
    { name: "AC & Fridge", query: "ac", count: "380+ verified" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-accent-primary/20 selection:text-accent-primary">
      {/* Top Brand Header */}
      <header className="sticky top-0 z-40 w-full h-18 bg-surface/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1240px] h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center min-h-tap group">
            <AsapLogo variant="horizontal" size="md" showTagline={true} />
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="#auth-card"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors hidden sm:inline-flex"
            >
              Sign In
            </a>
            <a
              href="#auth-card"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-primary-hover text-white transition-all shadow-sm shadow-accent-primary/20 active:scale-[0.98]"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-border-subtle">
          {/* Subtle Ambient Backing Glow */}
          <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -z-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Narrative & Acronym Explanation */}
              <div className="lg:col-span-7 space-y-6">
                {/* National Network Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                  <span>Nigeria's Verified Local Trade & Artisan Network</span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-black tracking-tight text-text-primary leading-[1.12]">
                  Direct contact with verified tradespeople in your neighborhood.
                </h1>

                {/* Prominently Spell Out A-S-A-P */}
                <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-primary">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>What ASAP Means</span>
                  </div>
                  <p className="text-base sm:text-lg font-heading font-bold text-text-primary tracking-tight">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1">
                      A
                    </span>
                    ny{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1 ml-1.5">
                      S
                    </span>
                    ervice{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1 ml-1.5">
                      S
                    </span>
                    wift{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1 ml-1.5">
                      A
                    </span>
                    ccess{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1 ml-1.5">
                      P
                    </span>
                    latform
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-1">
                    Connecting everyday Nigerian households and businesses directly to vetted artisans across all 36 states and the Federal Capital Territory.
                  </p>
                </div>

                {/* Narrative Description */}
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-[620px]">
                  Call or WhatsApp plumbers, electricians, carpenters, and auto mechanics without middlemen fees or booking commissions. Every provider has an official identity record on file.
                </p>

                {/* Trust Proof Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-[540px]">
                  <div className="p-3 rounded-xl border border-border-subtle bg-surface/60">
                    <div className="text-base sm:text-lg font-heading font-black text-accent-primary">
                      36 States
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      + Abuja FCT coverage
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-subtle bg-surface/60">
                    <div className="text-base sm:text-lg font-heading font-black text-text-primary">
                      Zero Fees
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      100% free for customers
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-subtle bg-surface/60">
                    <div className="text-base sm:text-lg font-heading font-black text-emerald-600 dark:text-emerald-400">
                      1 Month Free
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Provider trial, then ₦1k/mo
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Embedded Sign In / Sign Up Gateway */}
              <div id="auth-card" className="lg:col-span-5 flex justify-center lg:justify-end">
                <Suspense
                  fallback={
                    <div className="w-full max-w-[460px] h-[520px] rounded-2xl bg-surface border border-border-subtle animate-pulse flex items-center justify-center text-xs text-text-muted">
                      Loading authentication gateway...
                    </div>
                  }
                >
                  <LandingAuthCard />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        {/* Dual Value Propositions: Customers vs Service Providers */}
        <section className="py-16 sm:py-20 border-b border-border-subtle bg-surface/40">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-[680px] mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary tracking-tight">
                Built specifically for both sides of Nigerian trade
              </h2>
              <p className="text-sm text-text-secondary">
                Whether you need a technician urgently or run a skilled trade business, ASAP delivers swift, commission-free connection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Value Prop Card */}
              <div className="p-7 sm:p-8 rounded-3xl border border-border-subtle bg-surface space-y-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-accent-primary/10 text-accent-primary">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent-primary">
                      For Everyday Customers
                    </span>
                    <h3 className="text-xl font-heading font-bold text-text-primary">
                      Find trusted services in your neighborhood
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Direct contact:</strong> Call or WhatsApp the tradesperson immediately. No waiting for a dispatcher.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Identity on record:</strong> Every provider has captured a live selfie and submitted a government ID (NIN, voter card, driver license, or passport).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">State and city filtering:</strong> Filter technicians across all 36 Nigerian states and Abuja.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">100% free:</strong> Customers never pay platform fees, deposits, or search commissions.
                    </span>
                  </li>
                </ul>

                <a
                  href="#auth-card"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-accent-primary hover:underline pt-2"
                >
                  Create free customer account to browse &rarr;
                </a>
              </div>

              {/* Service Provider Value Prop Card */}
              <div className="p-7 sm:p-8 rounded-3xl border border-border-subtle bg-surface space-y-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-accent-primary/10 text-accent-primary text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-accent-primary/20">
                  1st Month Free
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      For Service Providers & Artisans
                    </span>
                    <h3 className="text-xl font-heading font-bold text-text-primary">
                      Reach nearby clients with zero commission
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Keep 100% of your earnings:</strong> No 15% or 20% commission taken from your hard-earned labor.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Direct client relationships:</strong> Clients call or message your WhatsApp phone directly.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">30-day initial free trial:</strong> Start listing your business immediately with zero upfront payment.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Predictable ₦1,000/month renewal:</strong> Low, transparent flat fee via Paystack after your trial.
                    </span>
                  </li>
                </ul>

                <a
                  href="#auth-card"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-2"
                >
                  Register as a service provider &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Trade Categories */}
        <section className="py-16 sm:py-20 border-b border-border-subtle">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-primary">
                  National Directory
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mt-1">
                  Popular trades available across Nigeria
                </h2>
              </div>
              <a
                href="#auth-card"
                className="text-xs font-semibold text-accent-primary hover:underline flex items-center gap-1"
              >
                Sign in to search all categories &rarr;
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {featuredTrades.map((trade) => (
                <a
                  key={trade.name}
                  href="#auth-card"
                  className="p-4 rounded-2xl border border-border-subtle bg-surface hover:border-accent-primary hover:shadow-sm transition-all duration-150 group"
                >
                  <p className="font-heading font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                    {trade.name}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">{trade.count}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Operating Principles / How It Works */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-[600px] mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-primary">
                Platform Integrity
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                How the ASAP platform works
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                Three core principles that maintain quality and trust across the network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-border-subtle bg-surface space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold font-mono text-sm">
                  01
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Verified Identity Record
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Every artisan captures a live selfie and uploads an official government identity document (NIN, voter card, driver license, or passport) before listing is published.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border-subtle bg-surface space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold font-mono text-sm">
                  02
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Swift Direct Contact
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  No middleman booking systems or wallet locking. You get one-tap phone calling and direct WhatsApp links to agree on job scope and pricing directly.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border-subtle bg-surface space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold font-mono text-sm">
                  03
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Zero Grace Period Integrity
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Artisans receive 30 days free, then renew at ₦1,000/month. If a subscription expires without renewal, contact buttons are automatically hidden immediately to guarantee active availability.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 bg-surface/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AsapLogo variant="horizontal" size="sm" showTagline={true} />
          <p className="text-xs text-text-muted text-center sm:text-right">
            &copy; 2026 ASAP Nigeria (Any Service Swift Access Platform). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
