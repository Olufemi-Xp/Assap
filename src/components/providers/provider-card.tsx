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
  Briefcase,
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
      className="assap-flip-perspective h-[396px] w-full cursor-pointer select-none"
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
      aria-label={`${provider.businessName} — ${provider.serviceTitle}. ${
        isFlipped ? "Showing business details" : "Showing service image"
      }. Hover or tap to flip.`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggleFlip();
        }
      }}
    >
      <div className={`assap-flip-inner ${isFlipped ? "assap-flip-inner--flipped" : ""}`}>
        {/* FRONT SIDE: Trade Image & Service Title */}
        <div className="assap-flip-face rounded-2xl border border-border-subtle bg-surface shadow-sm overflow-hidden flex flex-col">
          <div className="relative h-56 w-full overflow-hidden bg-slate-900 flex-shrink-0">
            <img
              src={imageUrl}
              alt={provider.serviceTitle}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"
            />

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-sm text-white text-[11px] font-bold border border-white/15">
                <Briefcase className="w-3 h-3 text-gold" />
                <span className="truncate max-w-[160px]">{provider.serviceTitle}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-950/75 backdrop-blur-sm text-white text-xs font-semibold tabular-nums border border-white/15">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                {provider.averageRating > 0 ? provider.averageRating.toFixed(1) : "New"}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-1.5 text-white">
                <h3 className="font-heading font-bold text-base truncate">{provider.businessName}</h3>
                <BadgeCheck className="w-4 h-4 text-verified flex-shrink-0" aria-label="Verified provider" />
              </div>
              <p className="text-[11px] text-white/85 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-gold flex-shrink-0" />
                <span className="truncate">{hierarchyLabel || provider.locationArea}</span>
              </p>
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between bg-surface">
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {provider.serviceDescription}
            </p>

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
              <span className="font-semibold text-accent-primary">
                {provider.serviceAreas.length} core service{provider.serviceAreas.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <RotateCw className="w-3 h-3" />
                <span>Hover or tap for details</span>
              </span>
            </div>
          </div>
        </div>

        {/* BACK SIDE: Full Business Details, Address, Contacts & Services */}
        <div className="assap-flip-face assap-flip-face--back rounded-2xl border border-accent-primary/40 bg-surface shadow-md overflow-hidden flex flex-col justify-between p-4">
          <div className="space-y-2.5 overflow-y-auto pr-0.5">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-border-subtle">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                  {provider.serviceTitle}
                </span>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-bold text-sm text-brand truncate">
                    {provider.businessName}
                  </h3>
                  <BadgeCheck className="w-4 h-4 text-verified flex-shrink-0" />
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted flex-shrink-0">
                <RotateCw className="w-3 h-3" />
                <span>Flip</span>
              </span>
            </div>

            {/* Office / Shop Address & Location */}
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
              <div className="pt-2 border-t border-border-subtle space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Services Offered
                </p>
                <ul className="space-y-1">
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
          <div className="space-y-1.5 pt-2 border-t border-border-subtle" onClick={(e) => e.stopPropagation()}>
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
  );
}
