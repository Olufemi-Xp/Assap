import React from "react";
import Link from "next/link";
import { AsapLogo } from "@/components/brand/asap-logo";
import {
  CheckCircle,
  Wrench,
  Search,
  Zap,
  ArrowRight,
  Compass,
  ShieldCheck,
  PhoneCall,
  Star,
} from "lucide-react";

export default function LandingPage() {
  const featuredTrades = [
    { name: "Plumbing", count: "1,240+ verified" },
    { name: "Electrical", count: "980+ verified" },
    { name: "Carpentry", count: "650+ verified" },
    { name: "Cleaning", count: "820+ verified" },
    { name: "Auto Mechanics", count: "540+ verified" },
    { name: "Generator Repair", count: "490+ verified" },
    { name: "Painting", count: "410+ verified" },
    { name: "AC & Fridge", count: "380+ verified" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-accent-primary/20 selection:text-accent-primary">
      {/* Top Brand Header */}
      <header className="sticky top-0 z-40 w-full h-[72px] bg-surface/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1240px] h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center min-h-tap group">
            <AsapLogo variant="horizontal" size="md" showTagline={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-primary-hover text-white transition-all shadow-sm shadow-accent-primary/20 active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Prominent Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-border-subtle">
          <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -z-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Value Proposition & Primary Hero CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                  <span>Nigeria&apos;s Verified Local Trade &amp; Artisan Network</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-[3.35rem] font-heading font-black tracking-tight text-text-primary leading-[1.1]">
                  Swift, direct access to verified local tradespeople near you.
                </h1>

                <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-[620px]">
                  ASAP (Any Service Swift Access Platform) connects Nigerian households and businesses directly with
                  vetted plumbers, electricians, cleaners, carpenters, and mechanics across every state, city, and local
                  government—with zero middleman fees.
                </p>

                {/* Primary Hero CTA Buttons -> Auth Page */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold text-sm transition-all shadow-md shadow-accent-primary/20 active:scale-[0.98]"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/auth/login?redirect=/explore"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-text-primary font-semibold text-sm transition-all active:scale-[0.98]"
                  >
                    <Compass className="w-4 h-4 text-accent-primary" />
                    <span>Explore Services</span>
                  </Link>
                </div>

                {/* Trust Proof Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-[540px]">
                  <div className="p-3 rounded-xl border border-border-subtle bg-surface/60">
                    <div className="text-base sm:text-lg font-heading font-black text-accent-primary">
                      36 States
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">+ Abuja FCT coverage</div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-subtle bg-surface/60">
                    <div className="text-base sm:text-lg font-heading font-black text-text-primary">
                      Zero Fees
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">100% free for customers</div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-subtle bg-surface/60">
                    <div className="text-base sm:text-lg font-heading font-black text-emerald-600 dark:text-emerald-400">
                      1 Month Free
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">Provider trial, then &#8358;1k/mo</div>
                  </div>
                </div>
              </div>

              {/* Right Column: ASAP Acronym & Trust Highlights */}
              <div className="lg:col-span-5">
                <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-border-subtle shadow-xl shadow-accent-primary/5 space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-primary via-emerald-400 to-amber-400" />

                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-primary pt-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>What ASAP Means</span>
                  </div>

                  <p className="text-base sm:text-lg font-heading font-bold text-text-primary tracking-tight leading-snug">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1">
                      A
                    </span>
                    ny{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1 ml-1">
                      S
                    </span>
                    ervice{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1 ml-1">
                      S
                    </span>
                    wift{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1 ml-1">
                      A
                    </span>
                    ccess{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-primary text-white font-black text-sm mr-1 ml-1">
                      P
                    </span>
                    latform
                  </p>

                  <div className="space-y-3 pt-2 border-t border-border-subtle text-xs text-text-secondary">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Before &amp; after portfolios:</strong> Inspect real
                        delivered jobs before you call.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <PhoneCall className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">One-tap phone &amp; WhatsApp:</strong> Reach local
                        artisans in your LGA immediately.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Community star ratings:</strong> Ranked by verified
                        customer reviews.
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <Link
                      href="/auth/signup"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold text-center transition-colors"
                    >
                      Create Free Account
                    </Link>
                    <Link
                      href="/auth/login"
                      className="flex-1 py-2.5 px-4 rounded-xl border border-border-subtle bg-surface-subtle/50 hover:bg-surface-subtle text-text-primary text-xs font-semibold text-center transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
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
                Whether you need a technician urgently or run a skilled trade business, ASAP delivers swift,
                commission-free connection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      <strong className="text-text-primary">Direct contact:</strong> Call or WhatsApp the tradesperson
                      immediately.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">State, City &amp; LGA filtering:</strong> Narrow down
                      verified technicians right inside your Local Government Area.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Delivered job portfolios:</strong> Review real before-and-after
                      work stories and customer ratings.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">100% free:</strong> Customers never pay platform fees or
                      search commissions.
                    </span>
                  </li>
                </ul>

                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-accent-primary hover:underline pt-2"
                >
                  Create free customer account to explore &rarr;
                </Link>
              </div>

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
                      For Service Providers &amp; Artisans
                    </span>
                    <h3 className="text-xl font-heading font-bold text-text-primary">
                      Showcase your work and win local jobs
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Keep 100% of your earnings:</strong> Zero commission taken
                      from your labor.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Portfolio showcase:</strong> Publish delivered job stories
                      with before/after photos to build trust.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">30-day initial free trial:</strong> Start listing
                      immediately with zero upfront payment.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Predictable &#8358;1,000/month renewal:</strong> Simple
                      Paystack billing after your trial.
                    </span>
                  </li>
                </ul>

                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-2"
                >
                  Register as a service provider &rarr;
                </Link>
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
              <Link
                href="/auth/login?redirect=/explore"
                className="text-xs font-semibold text-accent-primary hover:underline flex items-center gap-1"
              >
                Sign in to explore all categories &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {featuredTrades.map((trade) => (
                <Link
                  key={trade.name}
                  href="/auth/login?redirect=/explore"
                  className="p-4 rounded-2xl border border-border-subtle bg-surface hover:border-accent-primary hover:shadow-sm transition-all duration-150 group"
                >
                  <p className="font-heading font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                    {trade.name}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">{trade.count}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
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
                <h3 className="font-heading font-bold text-base text-text-primary">Verified Identity Record</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Every artisan captures a live selfie and uploads an official government identity document before listing
                  is published.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border-subtle bg-surface space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold font-mono text-sm">
                  02
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">Swift Direct Contact</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  No middleman booking systems or wallet locking. Get one-tap phone calling and direct WhatsApp links.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border-subtle bg-surface space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold font-mono text-sm">
                  03
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary">Zero Grace Period Integrity</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Artisans receive 30 days free, then renew at &#8358;1,000/month. Expired listings hide contact buttons
                  immediately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

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
