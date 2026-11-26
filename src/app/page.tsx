import React from "react";
import Link from "next/link";
import { AsapLogo } from "@/components/brand/asap-logo";
import ColourfulText from "@/components/ui/colourful-text";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  InteractiveImageAccordion,
  type AccordionItemData,
} from "@/components/ui/interactive-image-accordion";
import {
  CheckCircle,
  Wrench,
  Search,
  ArrowRight,
  Compass,
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
            <div className="px-4 sm:px-6 lg:pl-12 xl:pl-20 lg:pr-10 py-10 sm:py-16 lg:py-20 max-w-[660px] mx-auto lg:ml-auto lg:mr-0 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-verified/10 border border-verified/25 text-verified text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-verified animate-pulse" />
                <span>Nigeria&apos;s Verified Local Trade &amp; Artisan Network</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-black tracking-tight text-brand leading-[1.1]">
                Swift, direct access to <ColourfulText text="verified local tradespeople" /> near you.
              </h1>

              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-[580px]">
                ASSAP (Any Service Swift Access Platform) connects Nigerian households and businesses directly with
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
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary tracking-tight">
                Built specifically for both sides of Nigerian trade
              </h2>
              <p className="text-sm text-text-secondary">
                Whether you need a technician urgently or run a skilled trade business, ASSAP delivers swift,
                commission-free connection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative overflow-hidden p-7 sm:p-8 rounded-3xl border border-border-subtle bg-surface shadow-sm">
                <div aria-hidden="true" className="assap-card-wave z-0">
                  <svg
                    viewBox="0 0 1200 320"
                    preserveAspectRatio="none"
                    className="w-full h-full opacity-90 dark:opacity-45"
                  >
                    <path
                      d="M0,190 C150,130 300,250 450,190 C600,130 750,250 900,190 C1050,130 1125,215 1200,190 L1200,320 L0,320 Z"
                      fill="rgba(2, 132, 199, 0.08)"
                    />
                    <path
                      d="M0,230 C150,280 300,175 450,230 C600,280 750,175 900,230 C1050,280 1125,205 1200,230 L1200,320 L0,320 Z"
                      fill="rgba(224, 242, 254, 0.55)"
                    />
                  </svg>
                </div>

                <div className="relative z-10 space-y-6">
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
              </div>

              <div className="p-7 sm:p-8 rounded-3xl border border-border-subtle bg-surface shadow-sm relative overflow-hidden">
                <div aria-hidden="true" className="assap-card-wave assap-card-wave--delayed z-0">
                  <svg
                    viewBox="0 0 1200 320"
                    preserveAspectRatio="none"
                    className="w-full h-full opacity-90 dark:opacity-45"
                  >
                    <path
                      d="M0,195 C150,250 300,135 450,195 C600,250 750,135 900,195 C1050,250 1125,170 1200,195 L1200,320 L0,320 Z"
                      fill="rgba(14, 116, 144, 0.08)"
                    />
                    <path
                      d="M0,235 C150,180 300,280 450,235 C600,180 750,280 900,235 C1050,180 1125,255 1200,235 L1200,320 L0,320 Z"
                      fill="rgba(226, 197, 138, 0.20)"
                    />
                  </svg>
                </div>

                <div className="absolute top-0 right-0 z-20 bg-gold-pale/30 text-brand text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-gold-brushed/40">
                  1st Month Free
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-brand/10 text-indigo-brand">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-brand">
                        For Service Providers &amp; Artisans
                      </span>
                      <h3 className="text-xl font-heading font-bold text-text-primary">
                        Showcase your work and win local jobs
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-3.5 text-xs sm:text-sm text-text-secondary">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Keep 100% of your earnings:</strong> Zero commission taken
                        from your labor.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Portfolio showcase:</strong> Publish delivered job stories
                        with before/after photos to build trust.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">30-day initial free trial:</strong> Start listing
                        immediately with zero upfront payment.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Predictable &#8358;1,000/month renewal:</strong> Simple
                        Paystack billing after your trial.
                      </span>
                    </li>
                  </ul>

                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-brand hover:text-accent-secondary hover:underline pt-2"
                  >
                    Register as a service provider &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: ASSAP Full-Bleed Continuous Video Showcase */}
        <section id="support" className="pt-14 sm:pt-16 pb-0 border-b border-border-subtle overflow-hidden">
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-secondary">
              See ASSAP in Action
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand">
              Connecting Nigerian homes and businesses with trusted trades
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Watch how customers discover verified local artisans and connect directly in seconds.
            </p>
          </div>

          <div className="w-full overflow-hidden bg-brand">
            <video
              className="w-full block aspect-video max-h-[75vh] object-cover"
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="auto"
              poster="/images/Electrical%20Service.jpeg"
              aria-label="ASSAP platform overview video"
            >
              <source src="/video/assap-video.mp4" type="video/mp4" />
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        </section>

        {/* Section 4 (Final): Popular Trade Categories */}
        <section id="more" className="py-16 sm:py-20">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-primary">
                  National Directory
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand mt-1">
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
                  <p className="font-heading font-bold text-sm text-brand group-hover:text-accent-primary transition-colors">
                    {trade.name}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">{trade.count}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle py-8 bg-surface/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AsapLogo variant="horizontal" size="sm" showTagline={true} />
          <p className="text-xs text-text-muted text-center sm:text-right">
            &copy; 2026 ASSAP Nigeria (Any Service Swift Access Platform). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
