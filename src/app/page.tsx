import React from "react";
import Link from "next/link";
import { AsapLogo } from "@/components/brand/asap-logo";
import ColourfulText from "@/components/ui/colourful-text";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BackgroundShowcaseVideo } from "@/components/ui/background-showcase-video";
import { PlatformIntegrityPrinciples } from "@/components/ui/platform-integrity-principles";
import {
  GatheringHeading,
  ScrollTypingTradeBoxes,
} from "@/components/ui/scroll-motion";
import {
  InteractiveImageAccordion,
  type AccordionItemData,
} from "@/components/ui/interactive-image-accordion";
import {
  CheckCircle,
  Wrench,
  Search,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const heroAccordionItems: AccordionItemData[] = [
    { id: 1, title: "Plumbing", imageUrl: "/images/Plumber.jpeg" },
    { id: 2, title: "Electrical", imageUrl: "/images/Electrical%20Service.jpeg" },
    { id: 3, title: "Fashion Design", imageUrl: "/images/Fashion%20Designer.jpeg" },
    { id: 4, title: "Auto Mechanics", imageUrl: "/images/Automech%20Service.jpeg" },
    { id: 5, title: "Carpentry", imageUrl: "/images/Carpentry%20service.jpeg" },
    { id: 6, title: "Cleaning", imageUrl: "/images/Cleaning%20Service.jpeg" },
    { id: 7, title: "Generator Repair", imageUrl: "/images/Generator%20Repair.jpeg" },
    { id: 8, title: "Interior Decor", imageUrl: "/images/Interior%20Decor.jpeg" },
    { id: 9, title: "Event Chef", imageUrl: "/images/Event%20Chef.jpeg" },
    { id: 10, title: "Event Decor", imageUrl: "/images/Event%20Decor.jpeg" },
    { id: 11, title: "Hairdressing", imageUrl: "/images/Hairdressing%20Service.jpeg" },
    { id: 12, title: "Laundry", imageUrl: "/images/Laundry%20Service.jpeg" },
    { id: 13, title: "Makeup", imageUrl: "/images/Makeup%20service.jpeg" },
    { id: 14, title: "Welding", imageUrl: "/images/Weldering%20Service.jpeg" },
  ];

  return (
    <div id="top" className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-accent-primary/20 selection:text-accent-primary">
      {/* Top Brand Header */}
      <header className="sticky top-0 z-40 w-full bg-canvas/95 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center min-h-tap group flex-shrink-0">
            <AsapLogo variant="horizontal" size="md" showTagline={true} />
          </Link>

          <nav aria-label="Welcome navigation" className="hidden md:flex items-center gap-2">
            {[
              { label: "Home", href: "#top" },
              { label: "About", href: "#about" },
              { label: "Support", href: "#support" },
              { label: "More", href: "#more" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-brand hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors min-h-tap inline-flex items-center"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile compact nav row */}
        <nav
          aria-label="Mobile welcome navigation"
          className="md:hidden border-t border-border-subtle/70 px-4 py-1.5 flex items-center justify-around gap-1"
        >
          {[
            { label: "Home", href: "#top" },
            { label: "About", href: "#about" },
            { label: "Support", href: "#support" },
            { label: "More", href: "#more" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        {/* Prominent 50-50 Split Hero Section */}
        <section className="relative overflow-hidden border-b border-border-subtle">
          <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -z-10 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full lg:grid lg:grid-cols-2 lg:items-center">
            {/* Left Half: Hero Text, CTAs & Proof Metrics */}
            <div className="px-4 sm:px-6 lg:pl-12 xl:pl-20 lg:pr-10 py-8 sm:py-12 lg:py-16 max-w-[660px] mx-auto lg:ml-auto lg:mr-0 space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-black tracking-tight text-brand leading-[1.1]">
                Swift, direct access to <ColourfulText text="verified local tradespeople" /> near you.
              </h1>

              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-[580px]">
                ASSAP (Any Service Swift Access Platform) connects Nigerian households and businesses directly with
                vetted plumbers, electricians, cleaners, carpenters, and mechanics across every state, city, and local
                government—with zero middleman fees.
              </p>

              {/* Primary Hero CTA Button -> Auth Page */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold text-sm transition-all shadow-md shadow-accent-primary/20 active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
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
                <div className="p-3 rounded-xl border border-border-subtle bg-surface">
                  <div className="text-base sm:text-lg font-heading font-black text-accent-secondary">
                    1 Month Free
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">Provider trial, then &#8358;1k/mo</div>
                </div>
              </div>
            </div>

            {/* Right Half: Full-Half Borderless Continuous Scrolling Images */}
            <div className="w-full pb-10 lg:pb-0 lg:py-8">
              <InteractiveImageAccordion items={heroAccordionItems} defaultActiveIndex={0} />
            </div>
          </div>
        </section>

        {/* Dual Value Propositions: Customers vs Service Providers */}
        <section id="about" className="relative overflow-hidden py-16 sm:py-20 border-b border-border-subtle">
          <div
            aria-hidden="true"
            className="assap-section-gradient pointer-events-none absolute -inset-12 z-0"
          />
          <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-[680px] mx-auto mb-12 space-y-2">
              <GatheringHeading
                text="Built specifically for both sides of Nigerian trade"
                className="text-2xl sm:text-3xl font-heading font-bold text-text-primary tracking-tight"
              />
              <p className="text-sm text-text-secondary">
                Whether you need a technician urgently or run a skilled trade business, ASSAP delivers swift,
                commission-free connection.
              </p>
            </div>

            <ScrollTypingTradeBoxes
              customerIcon={<Search className="w-6 h-6" />}
              providerIcon={<Wrench className="w-6 h-6" />}
              checkCustomerIcon={<CheckCircle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />}
              checkProviderIcon={<CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />}
            />
          </div>
        </section>

        {/* Section 3: ASSAP Full-Bleed Silent Background Video Showcase */}
        <section
          id="support"
          className="relative w-full min-h-[420px] sm:min-h-[520px] lg:min-h-[620px] flex items-start overflow-hidden border-b border-border-subtle bg-brand"
        >
          <BackgroundShowcaseVideo
            src="/video/assap-video.mp4"
            poster="/images/Electrical%20Service.jpeg"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-slate-950/80 via-slate-950/35 to-slate-950/15"
          />
          <div className="relative z-20 w-full max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-28 text-center">
            <GatheringHeading
              text="Connecting Nigerian homes and businesses with trusted trades"
              className="text-2xl sm:text-4xl lg:text-[2.5rem] font-heading font-bold text-white leading-tight drop-shadow-md"
            />
          </div>
        </section>

        {/* Section 4: Platform Integrity */}
        <section
          id="integrity"
          className="relative w-full py-10 sm:py-12 border-b border-border-subtle bg-canvas text-text-primary overflow-hidden"
        >
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8">
            <PlatformIntegrityPrinciples />
          </div>
        </section>

        {/* Section 5 (Final): Artisan Tools Wave Showcase & Explore ASSAP CTA */}
        <section
          id="more"
          className="relative w-full min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] flex items-center justify-center overflow-hidden bg-slate-950"
        >
          {/* Full-bleed Artisan Tools background with continuous to-and-fro wave motion */}
          <div aria-hidden="true" className="pointer-events-none absolute -inset-8 z-0">
            <img
              src="/images/Artisan%20tools.jpeg"
              alt=""
              className="assap-artisan-wave h-full w-full object-cover select-none"
            />
          </div>

          {/* Fluid wave sheen & contrast scrim */}
          <div
            aria-hidden="true"
            className="assap-artisan-wave-sheen pointer-events-none absolute -inset-12 z-[1]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-slate-950/60 bg-[radial-gradient(circle_at_center,rgba(2,6,23,0.45)_0%,rgba(2,6,23,0.82)_100%)]"
          />

          {/* Centered Foreground Layer */}
          <div className="relative z-10 max-w-[780px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center flex flex-col items-center gap-8">
            <h2 className="assap-luminous-flash text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-black tracking-tight text-white leading-tight">
              Need or Render a Service?
            </h2>

            {/* Multi-color flare-lit Explore ASSAP CTA (Red, Blue, Gold, Green) */}
            <div className="relative inline-flex group">
              <span
                aria-hidden="true"
                className="assap-multi-flare-glow pointer-events-none absolute -inset-3 rounded-3xl blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-[2px] rounded-2xl overflow-hidden"
              >
                <span className="assap-multi-flare-ring block h-full w-full scale-150" />
              </span>
              <Link
                href="/auth/login?redirect=/explore"
                className="relative inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-[14px] bg-slate-950/90 hover:bg-slate-900/95 text-white font-heading font-bold text-base sm:text-lg tracking-wide shadow-2xl transition-transform duration-200 active:scale-[0.98]"
              >
                <span>Explore ASSAP</span>
                <ArrowRight className="w-5 h-5 text-gold transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle py-8 bg-surface/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <AsapLogo variant="horizontal" size="sm" showTagline={true} />

            {/* Footer Action Links */}
            <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Link
                href="/contact"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/terms"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors"
              >
                Terms &amp; Policy
              </Link>
              <Link
                href="/support"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors"
              >
                Support
              </Link>
            </nav>

            {/* Tiny Icon-Only Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="p-2 rounded-lg text-text-muted hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="p-2 rounded-lg text-text-muted hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-lg text-text-muted hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-2 rounded-lg text-text-muted hover:text-accent-primary hover:bg-surface-subtle/60 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle/70 text-center md:text-right">
            <p className="text-xs text-text-muted">
              &copy; 2026 ASSAP Nigeria (Any Service Swift Access Platform). All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
