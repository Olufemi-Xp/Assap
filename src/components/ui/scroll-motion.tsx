"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

export interface GatheringHeadingProps {
  text: string;
  className?: string;
  wordClassName?: string;
  as?: "h2" | "h3" | "p";
  delayOffset?: number;
}

/**
 * Scroll-direction-independent "gathering" heading: triggers once when the heading
 * enters the viewport from either scroll direction, smoothly converging words into place
 * and keeping them settled without scattering on scroll reversal.
 */
export function GatheringHeading({
  text,
  className = "",
  wordClassName = "",
  as = "h2",
  delayOffset = 0,
}: GatheringHeadingProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const prefersReduced = useReducedMotion();
  const isInView = useInView(ref, { amount: 0.2 });

  const Tag = as;

  if (prefersReduced) {
    return (
      <Tag className={className}>
        {wordClassName ? <span className={wordClassName}>{text}</span> : text}
      </Tag>
    );
  }

  const words = text.split(" ");
  const center = (words.length - 1) / 2;

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement & HTMLParagraphElement>} className={className} aria-label={text}>
      {words.map((word, idx) => {
        const distFromCenter = idx - center;
        const startX = distFromCenter * 16;
        const startY = 14 + Math.abs(distFromCenter) * 3.5;

        return (
          <motion.span
            key={`${word}-${idx}`}
            initial={{ x: startX, y: startY, opacity: 0.15 }}
            animate={
              isInView
                ? { x: 0, y: 0, opacity: 1 }
                : { x: startX, y: startY, opacity: 0.15 }
            }
            transition={
              isInView
                ? {
                    duration: 0.65,
                    delay: delayOffset + Math.min(idx * 0.03, 0.28),
                    ease: [0.22, 1, 0.36, 1],
                  }
                : { duration: 0.15 }
            }
            className={`inline-block mr-[0.26em] last:mr-0 ${wordClassName}`}
          >
            {word}
          </motion.span>
        );
      })}
    </Tag>
  );
}

export interface ScrollTypedTextProps {
  text: string;
  progress: MotionValue<number>;
  startAt?: number;
  endAt?: number;
  className?: string;
}

/**
 * Renders text that types out progressively driven by a shared MotionValue.
 * Uses an invisible layout-reserving span so card height never shifts while typing.
 */
export function ScrollTypedText({
  text,
  progress,
  startAt = 0,
  endAt = 1,
  className = "",
}: ScrollTypedTextProps) {
  const prefersReduced = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(prefersReduced ? text.length : 0);

  useEffect(() => {
    if (prefersReduced) {
      setVisibleCount(text.length);
      return;
    }

    const update = (v: number) => {
      const span = Math.max(0.01, endAt - startAt);
      const ratio = Math.min(1, Math.max(0, (v - startAt) / span));
      setVisibleCount(Math.round(ratio * text.length));
    };

    update(progress.get());
    const unsub = progress.on("change", update);
    return () => unsub();
  }, [progress, startAt, endAt, text.length, prefersReduced]);

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`relative inline-block ${className}`} aria-label={text}>
      <span aria-hidden="true" className="opacity-0 select-none">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0">
        {text.slice(0, visibleCount)}
      </span>
    </span>
  );
}

/**
 * Scroll-direction-independent container for the two trade boxes in Section 2:
 * once the boxes enter the viewport from either direction, text types out smoothly
 * and remains settled without reversing or scattering on scroll changes.
 */
export function ScrollTypingTradeBoxes({
  customerIcon,
  providerIcon,
  checkCustomerIcon,
  checkProviderIcon,
}: {
  customerIcon: React.ReactNode;
  providerIcon: React.ReactNode;
  checkCustomerIcon: React.ReactNode;
  checkProviderIcon: React.ReactNode;
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });
  // Symmetric scroll-driven progress: writes 0 -> 1 as boxes approach center
  // from either direction (scrolling down or scrolling up), staying 1 when centered.
  const typingProgress = useTransform(
    scrollYProgress,
    [0.05, 0.40, 0.60, 0.95],
    [0, 1, 1, 0]
  );

  const customerItems = [
    {
      lead: "Direct contact:",
      body: "Call or WhatsApp the tradesperson immediately.",
      start: 0.16,
      end: 0.42,
    },
    {
      lead: "State, City & LGA filtering:",
      body: "Narrow down verified technicians right inside your Local Government Area.",
      start: 0.34,
      end: 0.62,
    },
    {
      lead: "Delivered job portfolios:",
      body: "Review real before-and-after work stories and customer ratings.",
      start: 0.54,
      end: 0.80,
    },
    {
      lead: "100% free:",
      body: "Customers never pay platform fees or search commissions.",
      start: 0.72,
      end: 0.96,
    },
  ];

  const providerItems = [
    {
      lead: "Keep 100% of your earnings:",
      body: "Zero commission taken from your labor.",
      start: 0.16,
      end: 0.42,
    },
    {
      lead: "Portfolio showcase:",
      body: "Publish delivered job stories with before/after photos to build trust.",
      start: 0.34,
      end: 0.62,
    },
    {
      lead: "30-day initial free trial:",
      body: "Start listing immediately with zero upfront payment.",
      start: 0.54,
      end: 0.80,
    },
    {
      lead: "Predictable ₦1,000/month renewal:",
      body: "Simple Paystack billing after your trial.",
      start: 0.72,
      end: 0.96,
    },
  ];

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Customers Box */}
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
            <div className="p-3 rounded-2xl bg-accent-primary/10 text-accent-primary">{customerIcon}</div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-accent-primary">
                <ScrollTypedText text="For Everyday Customers" progress={typingProgress} startAt={0} endAt={0.18} />
              </span>
              <h3 className="text-xl font-heading font-bold text-text-primary">
                <ScrollTypedText
                  text="Find trusted services in your neighborhood"
                  progress={typingProgress}
                  startAt={0.05}
                  endAt={0.28}
                />
              </h3>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-text-secondary">
            {customerItems.map((item) => (
              <li key={item.lead} className="flex items-start gap-2.5">
                {checkCustomerIcon}
                <ScrollTypedText
                  text={`${item.lead} ${item.body}`}
                  progress={typingProgress}
                  startAt={item.start}
                  endAt={item.end}
                />
              </li>
            ))}
          </ul>

          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-xs font-semibold text-accent-primary hover:underline pt-2"
          >
            <ScrollTypedText
              text="Create free customer account to explore →"
              progress={typingProgress}
              startAt={0.82}
              endAt={1}
            />
          </a>
        </div>
      </div>

      {/* Service Providers Box */}
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
            <div className="p-3 rounded-2xl bg-indigo-brand/10 text-indigo-brand">{providerIcon}</div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-indigo-brand">
                <ScrollTypedText
                  text="For Service Providers & Artisans"
                  progress={typingProgress}
                  startAt={0}
                  endAt={0.18}
                />
              </span>
              <h3 className="text-xl font-heading font-bold text-text-primary">
                <ScrollTypedText
                  text="Showcase your work and win local jobs"
                  progress={typingProgress}
                  startAt={0.05}
                  endAt={0.28}
                />
              </h3>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-text-secondary">
            {providerItems.map((item) => (
              <li key={item.lead} className="flex items-start gap-2.5">
                {checkProviderIcon}
                <ScrollTypedText
                  text={`${item.lead} ${item.body}`}
                  progress={typingProgress}
                  startAt={item.start}
                  endAt={item.end}
                />
              </li>
            ))}
          </ul>

          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-brand hover:text-accent-secondary hover:underline pt-2"
          >
            <ScrollTypedText
              text="Register as a service provider →"
              progress={typingProgress}
              startAt={0.82}
              endAt={1}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
