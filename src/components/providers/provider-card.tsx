"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProviderContactGate } from "./provider-contact-gate";
import { formatLocation } from "@/lib/constants/nigeria-locations";
import { resolveProviderImage } from "@/lib/constants/directory-showcase";
import type { ProviderListItemDTO } from "@/types/domain";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  RotateCw,
  Star,
} from "lucide-react";

export interface ProviderCardProps {
  provider: ProviderListItemDTO;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTappedFlipped, setIsTappedFlipped] = useState(false);

  const isShowcaseCard = provider.id.startsWith("dir-");
  const isContactVisible = provider.canContact;
  const imageUrl = resolveProviderImage(provider);

  const hierarchyLabel = formatLocation({
    state: provider.state,
    city: provider.city,
    lga: provider.lga,
  });

  const visibleAreas = provider.serviceAreas.slice(0, 3);
  const addressText =
    provider.officeAddress ||
    [provider.locationArea, hierarchyLabel].filter(Boolean).join(", ");

  const isFlipped = isHovered || isTappedFlipped;

  const handleToggleFlip = () => {
    setIsTappedFlipped((prev) => !prev);
  };

  return (
    <div
      className="relative h-[380px] w-full rounded-2xl p-[2px] cursor-pointer select-none"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          setIsHovered(true);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          setIsHovered(false);
        }
      }}
      onClick={handleToggleFlip}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${provider.serviceTitle} — ${provider.businessName}. ${
        isFlipped ? "Showing business details" : "Showing service image"
      }. Hover or tap to flip.`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggleFlip();
        }
      }}
    >
      {/* Soft ambient multi-color outer glow (slowly orbits on front, steady beaming on back) */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-1 rounded-[18px] blur-md transition-opacity duration-300 overflow-hidden ${
          isFlipped ? "opacity-95" : "opacity-55"
        }`}
      >
        <span
          className={`assap-card-glow-gradient block h-full w-full scale-150 ${
            isFlipped ? "assap-card-glow-static" : "assap-card-glow-orbit"
          }`}
        />
      </span>

      {/* Crisp continuous 2px multi-color border ring (blue, red, gold, teal green) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden"
      >
        <span
          className={`assap-card-glow-gradient block h-full w-full scale-150 ${
            isFlipped ? "assap-card-glow-static" : "assap-card-glow-orbit"
          }`}
        />
      </span>

      <div className="assap-flip-perspective relative z-10 h-full w-full">
        <div className={`assap-flip-inner ${isFlipped ? "assap-flip-inner--flipped" : ""}`}>
          {/* FRONT SIDE: Full-bleed Image + Trade/Service Name Only */}
          <div className="assap-flip-face rounded-[14px] bg-slate-950 overflow-hidden">
            <img
              src={imageUrl}
              alt={provider.serviceTitle}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-heading font-extrabold text-xl sm:text-[1.35rem] text-white tracking-tight drop-shadow-md">
                {provider.serviceTitle}
              </h3>
            </div>
          </div>

          {/* BACK SIDE: All Business Details, Rating, Address, Contacts & Services */}
          <div className="assap-flip-face assap-flip-face--back rounded-[14px] bg-surface overflow-hidden flex flex-col justify-between p-4">
            <div className="space-y-2 overflow-y-auto pr-0.5">
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-border-subtle">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                    {provider.serviceTitle}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading font-bold text-sm text-brand truncate">
                      {provider.businessName}
                    </h3>
                    <BadgeCheck className="w-4 h-4 text-verified flex-shrink-0" aria-label="Verified provider" />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-primary tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    {provider.averageRating > 0 ? provider.averageRating.toFixed(1) : "New"}
                    {provider.ratingCount > 0 && (
                      <span className="text-[10px] text-text-muted font-normal">({provider.ratingCount})</span>
                    )}
                  </span>
                  <RotateCw className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                </div>
              </div>

              <p className="text-[11px] text-text-secondary line-clamp-2 leading-snug">
                {provider.serviceDescription}
              </p>

              {/* Office / Shop Address, Location & Contacts */}
              <div className="space-y-1 text-[11px]">
                <p className="flex items-start gap-1.5 text-text-secondary">
                  <Building2 className="w-3.5 h-3.5 text-accent-primary flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{addressText}</span>
                </p>
                {hierarchyLabel && (
                  <p className="flex items-center gap-1.5 text-text-muted">
                    <MapPin className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                    <span className="truncate">{hierarchyLabel}</span>
                  </p>
                )}
                {isContactVisible && provider.phoneNumber && (
                  <p className="flex items-center gap-1.5 text-text-primary font-medium tabular-nums">
                    <Phone className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                    <span>{provider.phoneNumber}</span>
                  </p>
                )}
                {isContactVisible && provider.whatsappNumber && (
                  <p className="flex items-center gap-1.5 text-text-primary font-medium tabular-nums">
                    <MessageCircle className="w-3.5 h-3.5 text-verified flex-shrink-0" />
                    <span>WhatsApp: {provider.whatsappNumber}</span>
                  </p>
                )}
              </div>

              {/* Services Offered */}
              {visibleAreas.length > 0 && (
                <div className="pt-1.5 border-t border-border-subtle space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Services Offered
                  </p>
                  <ul className="space-y-0.5">
                    {visibleAreas.map((area, idx) => (
                      <li key={`${area}-${idx}`} className="flex items-start gap-1.5 text-[11px] text-text-secondary">
                        <CheckCircle2 className="w-3 h-3 text-accent-primary flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions (stopPropagation so tapping Call/WhatsApp or Profile doesn't flip card) */}
            <div className="space-y-1 pt-2 border-t border-border-subtle" onClick={(e) => e.stopPropagation()}>
              <ProviderContactGate
                canContact={isContactVisible}
                phoneNumber={provider.phoneNumber}
                whatsappNumber={provider.whatsappNumber}
                businessName={provider.businessName}
              />
              {!isShowcaseCard && (
                <Link
                  href={`/providers/${provider.id}`}
                  className="w-full py-1 px-2 rounded-lg text-[11px] font-semibold text-accent-primary hover:bg-accent-primary/10 transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Full Profile &amp; Portfolio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
