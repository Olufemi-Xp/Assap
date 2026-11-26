"use client";

import React, { useEffect, useRef, useState } from "react";

export interface AccordionItemData {
  id: number | string;
  title: string;
  imageUrl: string;
}

export interface InteractiveImageAccordionProps {
  items: AccordionItemData[];
  defaultActiveIndex?: number;
  className?: string;
}

/**
 * Continuous, slow right-to-left scrolling showcase of all ASSAP trade images.
 * - Clean borderless image tiles with no outer frames or edge fade/blur overlays.
 * - Desktop: pauses on mouse enter and resumes immediately on mouse leave.
 * - Mobile / Touch: pauses when touched inside and resumes when tapping outside.
 */
export const InteractiveImageAccordion: React.FC<InteractiveImageAccordionProps> = ({
  items,
  defaultActiveIndex = 0,
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(defaultActiveIndex);
  const [isPaused, setIsPaused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const loopItems = [...items, ...items];

  useEffect(() => {
    const handleOutsidePointer = (event: Event) => {
      const target = event.target as Node | null;
      if (wrapperRef.current && target && !wrapperRef.current.contains(target)) {
        setIsPaused(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer, { passive: true });
    document.addEventListener("touchstart", handleOutsidePointer, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("touchstart", handleOutsidePointer);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      className={`marquee-wrapper relative w-full overflow-hidden ${className}`}
      aria-label="Continuous showcase of local trades on ASSAP"
    >
      <div
        className="animate-assap-marquee flex flex-row items-stretch gap-3 sm:gap-4"
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {loopItems.map((item, idx) => {
          const originalIndex = idx % items.length;
          const isActive = originalIndex === activeIndex;

          return (
            <div
              key={`${item.id}-${idx}`}
              role="button"
              tabIndex={idx < items.length ? 0 : -1}
              aria-label={item.title}
              onMouseEnter={() => setActiveIndex(originalIndex)}
              onClick={() => {
                setActiveIndex(originalIndex);
                setIsPaused(true);
              }}
              className={`
                relative h-[360px] sm:h-[440px] lg:h-[520px] rounded-xl overflow-hidden cursor-pointer shrink-0
                transition-all duration-500 ease-out
                focus:outline-none focus:ring-2 focus:ring-accent-primary
                ${isActive ? "w-[230px] sm:w-[270px] lg:w-[290px]" : "w-[180px] sm:w-[215px] lg:w-[230px]"}
              `}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = "/icons/icon-192.svg";
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <span className="absolute bottom-4 left-3.5 right-3.5 text-center text-white text-xs sm:text-sm font-heading font-bold tracking-tight truncate">
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveImageAccordion;
