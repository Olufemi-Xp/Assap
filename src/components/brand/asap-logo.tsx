import React from "react";

export interface AsapLogoProps {
  variant?: "full" | "mark" | "horizontal" | "stacked";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

export function AsapEmblem({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-label="ASSAP Logo Emblem"
    >
      <defs>
        {/* Main Brand Indigo-to-Teal-Blue Gradient */}
        <linearGradient id="asap-teal-grad" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#0E7490" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Champagne Gold Bolt Accent Gradient */}
        <linearGradient id="asap-bolt-grad" x1="18" y1="14" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2C58A" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#C5A46D" />
        </linearGradient>

        {/* Subtle Highlight Reflection */}
        <linearGradient id="asap-highlight" x1="12" y1="8" x2="36" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>

        {/* Soft Drop Shadow Filter */}
        <filter id="asap-shadow" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Rounded Brand Vessel */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="11"
        fill="url(#asap-teal-grad)"
        stroke="#0284C7"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        filter="url(#asap-shadow)"
      />

      {/* Internal Subtle Pattern/Grid Lines for Technical Precision */}
      <path
        d="M3 13.5H45M3 34.5H45"
        stroke="#FFFFFF"
        strokeOpacity="0.06"
        strokeWidth="1"
      />

      {/* Dynamic Monogram 'A' - Left Ascension Wing */}
      <path
        d="M12.5 35.5L22.2 12.8C22.8 11.4 24.2 10.5 25.7 10.5C27.2 10.5 28.6 11.4 29.2 12.8L38.9 35.5C39.4 36.7 38.5 38 37.2 38H33.1C32.1 38 31.2 37.4 30.8 36.5L28.6 31H19.4L17.2 36.5C16.8 37.4 15.9 38 14.9 38H10.8C9.5 38 8.6 36.7 9.1 35.5H12.5Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />

      {/* Negative Space Center Apex Cut */}
      <path
        d="M24 16.5L27 25H21L24 16.5Z"
        fill="url(#asap-teal-grad)"
      />

      {/* Swift Lightning Bolt / Direct Speed Connection Spark */}
      <path
        d="M26.5 12L17.5 25.5H23.5L20 37.5L31.5 22.5H25.5L26.5 12Z"
        fill="url(#asap-bolt-grad)"
        stroke="#FFFFFF"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      {/* Upper Specular Gloss Arc */}
      <path
        d="M4.5 14C4.5 8.75 8.75 4.5 14 4.5H34C39.25 4.5 43.5 8.75 43.5 14C43.5 11 39.25 8.5 34 8.5H14C8.75 8.5 4.5 11 4.5 14Z"
        fill="url(#asap-highlight)"
      />
    </svg>
  );
}

export function AsapLogo({
  variant = "horizontal",
  size = "md",
  showTagline = true,
  className = "",
}: AsapLogoProps) {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const markSize = pixelSizes[size] || 36;

  if (variant === "mark") {
    return <AsapEmblem size={markSize} className={className} />;
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        <AsapEmblem size={markSize * 1.3} />
        <div>
          <div className="flex items-center justify-center gap-2">
            <span className="font-heading font-black tracking-tight text-3xl sm:text-4xl text-brand">
              ASSAP
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-verified/10 text-verified border border-verified/25">
              Nigeria
            </span>
          </div>
          {showTagline && (
            <p className="text-xs sm:text-sm text-text-muted mt-1 font-medium max-w-[280px]">
              <span className="text-accent-primary font-bold">A</span>ny{" "}
              <span className="text-accent-primary font-bold">S</span>ervice{" "}
              <span className="text-accent-primary font-bold">S</span>wift{" "}
              <span className="text-accent-primary font-bold">A</span>ccess{" "}
              <span className="text-accent-primary font-bold">P</span>latform
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal / Full
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <AsapEmblem size={markSize} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-heading font-black tracking-tight text-brand ${
              size === "sm"
                ? "text-lg"
                : size === "md"
                ? "text-xl sm:text-2xl"
                : size === "lg"
                ? "text-2xl sm:text-3xl"
                : "text-3xl sm:text-4xl"
            }`}
          >
            ASSAP
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-verified/10 text-verified border border-verified/25">
            NG
          </span>
        </div>
        {showTagline && size !== "sm" && (
          <span className="text-[10px] sm:text-[11px] font-medium text-text-muted leading-tight tracking-tight">
            <span className="text-accent-primary font-bold">A</span>ny{" "}
            <span className="text-accent-primary font-bold">S</span>ervice{" "}
            <span className="text-accent-primary font-bold">S</span>wift{" "}
            <span className="text-accent-primary font-bold">A</span>ccess{" "}
            <span className="text-accent-primary font-bold">P</span>latform
          </span>
        )}
      </div>
    </div>
  );
}
