"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GatheringHeading } from "@/components/ui/scroll-motion";

const PRINCIPLES = [
  {
    lead: "Verified Identity Record:",
    body: "Every artisan captures a live selfie and uploads an official government ID document before listing is published.",
  },
  {
    lead: "Swift Direct Contact:",
    body: "No middleman booking systems or wallet locking. Get one-tap phone calling and direct WhatsApp links.",
  },
  {
    lead: "Zero Grace Period Integrity:",
    body: "Artisans receive 30 days free, then renew at ₦1,000 per month. Expired listings hide contact buttons immediately.",
  },
];

type Phase = "enter" | "jiggle" | "hold" | "drop" | "impact" | "exit";

/**
 * Coordinates the Section 4 Platform Integrity heading stack (with text-clipped
 * multi-color light beam), the 5-second water-droplet formation from the bottom edge
 * of the heading text, and the synchronized sliding principle lines below.
 */
export function PlatformIntegrityPrinciples() {
  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    if (prefersReduced) return;

    let timer: ReturnType<typeof setTimeout>;

    if (phase === "enter") {
      timer = setTimeout(() => setPhase("jiggle"), 550);
    } else if (phase === "jiggle") {
      timer = setTimeout(() => setPhase("hold"), 420);
    } else if (phase === "hold") {
      // 5-second center hold synchronized with droplet formation
      timer = setTimeout(() => setPhase("drop"), 5000);
    } else if (phase === "drop") {
      timer = setTimeout(() => setPhase("impact"), 420);
    } else if (phase === "impact") {
      timer = setTimeout(() => setPhase("exit"), 550);
    } else {
      timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % PRINCIPLES.length);
        setPhase("enter");
      }, 520);
    }

    return () => clearTimeout(timer);
  }, [phase, prefersReduced]);

  const headingStack = (
    <div className="max-w-[780px] mx-auto text-center space-y-2">
      <GatheringHeading
        as="h2"
        text="Platform Integrity"
        className="text-3xl sm:text-[2.5rem] font-heading font-black tracking-tight"
        wordClassName="assap-text-beam"
      />
      <GatheringHeading
        as="h3"
        delayOffset={0.08}
        text="How the ASSAP platform works"
        className="text-xl sm:text-[1.65rem] font-heading font-extrabold"
        wordClassName="assap-text-beam"
      />
      <GatheringHeading
        as="p"
        delayOffset={0.14}
        text="Three core principles that maintain quality and trust across the network."
        className="text-base sm:text-xl font-heading font-semibold"
        wordClassName="assap-text-beam"
      />
    </div>
  );

  if (prefersReduced) {
    return (
      <div className="space-y-8 sm:space-y-10">
        {headingStack}
        <div className="max-w-[820px] mx-auto space-y-5 text-center">
          {PRINCIPLES.map((item) => (
            <p
              key={item.lead}
              className="text-lg sm:text-2xl leading-snug sm:leading-relaxed font-heading text-[#0E7490] dark:text-[#38BDF8]"
            >
              <span className="font-semibold text-[#0E7490] dark:text-[#38BDF8]">{item.lead}</span>{" "}
              <strong className="font-bold text-[#0891B2] dark:text-[#22D3EE]">{item.body}</strong>
            </p>
          ))}
        </div>
      </div>
    );
  }

  const current = PRINCIPLES[index];
  const isImpacted = phase === "impact" || phase === "exit";

  const dropletAnimate =
    phase === "hold"
      ? { scale: 1, y: 0, opacity: 1 }
      : phase === "drop"
      ? { scale: [1, 0.9, 1.06], y: 58, opacity: [1, 1, 0] }
      : { scale: 0.12, y: 0, opacity: 0 };

  const dropletTransition =
    phase === "hold"
      ? { duration: 5.0, ease: [0.35, 0, 0.25, 1] as const }
      : phase === "drop"
      ? { duration: 0.42, ease: [0.55, 0, 1, 0.6] as const }
      : { duration: 0.12 };

  const lineAnimate =
    phase === "enter"
      ? { x: 0, opacity: 1, scale: 1 }
      : phase === "jiggle"
      ? { x: [0, -7, 7, -5, 5, -2, 2, 0], opacity: 1, scale: 1 }
      : phase === "hold" || phase === "drop"
      ? { x: 0, opacity: 1, scale: 1 }
      : phase === "impact"
      ? { x: 0, opacity: 1, scale: [1, 1.018, 1] }
      : { x: "-48vw", opacity: 0, scale: 1 };

  const lineTransition =
    phase === "enter"
      ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }
      : phase === "jiggle"
      ? { duration: 0.42, ease: "easeInOut" as const }
      : phase === "hold" || phase === "drop"
      ? { duration: 0.1 }
      : phase === "impact"
      ? { duration: 0.32, ease: "easeOut" as const }
      : { duration: 0.52, ease: [0.55, 0, 1, 0.45] as const };

  return (
    <div className="space-y-0">
      {headingStack}

      {/* Sleek droplet formation & drop corridor directly beneath bottom edge of heading text */}
      <div className="relative h-14 sm:h-16 flex justify-center items-start pointer-events-none" aria-hidden="true">
        <motion.div
          key={`droplet-${index}`}
          initial={{ scale: 0.12, y: 0, opacity: 0 }}
          animate={dropletAnimate}
          transition={dropletTransition}
          style={{ transformOrigin: "top center" }}
          className="relative mt-0.5 flex flex-col items-center will-change-transform"
        >
          {/* Realistic multi-color water droplet */}
          <svg
            viewBox="0 0 28 38"
            className="w-6 h-8 drop-shadow-[0_6px_14px_rgba(59,130,246,0.4)]"
          >
            <defs>
              <radialGradient id={`assap-drop-${index}`} cx="38%" cy="58%" r="68%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="38%" stopColor="#3b82f6" />
                <stop offset="72%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#ef4444" />
              </radialGradient>
            </defs>
            <path
              d="M14 1.5 C14 1.5 2.5 16.2 2.5 24.5 C2.5 31.1 7.6 36.2 14 36.2 C20.4 36.2 25.5 31.1 25.5 24.5 C25.5 16.2 14 1.5 14 1.5 Z"
              fill={`url(#assap-drop-${index})`}
            />
            <ellipse cx="10" cy="23" rx="2.6" ry="4.8" fill="rgba(255,255,255,0.48)" />
            <circle cx="17.5" cy="28.5" r="1.4" fill="rgba(255,255,255,0.35)" />
          </svg>
        </motion.div>
      </div>

      {/* Sequential sliding principle lines */}
      <div className="w-full overflow-hidden">
        <div className="relative min-h-[120px] sm:min-h-[96px] flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ x: "48vw", opacity: 0, scale: 1 }}
              animate={lineAnimate}
              transition={lineTransition}
              className="max-w-[820px] mx-auto text-center text-xl sm:text-2xl lg:text-[1.75rem] leading-snug sm:leading-relaxed font-heading will-change-transform"
            >
              <span
                className={
                  isImpacted
                    ? "assap-text-beam-impact font-semibold"
                    : "font-semibold text-[#0E7490] dark:text-[#38BDF8] transition-colors duration-300"
                }
              >
                {current.lead}
              </span>{" "}
              <strong
                className={
                  isImpacted
                    ? "assap-text-beam-impact font-bold"
                    : "font-bold text-[#0891B2] dark:text-[#22D3EE] transition-colors duration-300"
                }
              >
                {current.body}
              </strong>
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtle progression indicator */}
        <div className="mt-3 flex items-center justify-center gap-2" aria-hidden="true">
          {PRINCIPLES.map((item, i) => (
            <span
              key={item.lead}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-[#0E7490] dark:bg-[#38BDF8]"
                  : "w-1.5 bg-[#0E7490]/25 dark:bg-[#38BDF8]/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
