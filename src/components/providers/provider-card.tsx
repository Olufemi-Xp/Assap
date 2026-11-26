import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProviderContactGate } from "./provider-contact-gate";
import { formatLocation } from "@/lib/constants/nigeria-locations";
import type { ProviderListItemDTO } from "@/types/domain";
import { Star, MapPin, ArrowUpRight, Briefcase, CheckCircle2, BadgeCheck } from "lucide-react";

export interface ProviderCardProps {
  provider: ProviderListItemDTO;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const isContactVisible = provider.canContact;
  const hierarchyLabel = formatLocation({
    state: provider.state,
    city: provider.city,
    lga: provider.lga,
  });

  const visibleAreas = provider.serviceAreas.slice(0, 4);
  const extraAreasCount = Math.max(0, provider.serviceAreas.length - visibleAreas.length);

  return (
    <Card hoverable className="relative overflow-hidden flex flex-col justify-between h-full p-5 space-y-4">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-secondary via-accent-primary to-indigo-brand" />

      <div className="space-y-3 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary text-[11px] font-bold">
              <Briefcase className="w-3 h-3" />
              <span className="truncate">{provider.serviceTitle}</span>
            </span>

            <Link
              href={`/providers/${provider.id}`}
              className="flex items-center gap-1.5 font-heading font-bold text-base text-brand hover:text-accent-primary transition-colors"
            >
              <span className="truncate">{provider.businessName}</span>
              <BadgeCheck className="w-4 h-4 text-verified flex-shrink-0" aria-label="Verified provider" />
            </Link>

            <p className="text-[11px] text-text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3 text-accent-primary flex-shrink-0" />
              <span className="truncate">
                {provider.locationArea ? `${provider.locationArea}${hierarchyLabel ? " • " : ""}` : ""}
                {hierarchyLabel}
              </span>
            </p>
          </div>

          <span className="flex items-center gap-1 text-xs font-semibold text-text-primary tabular-nums flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            {provider.averageRating > 0 ? provider.averageRating.toFixed(1) : "New"}
            {provider.ratingCount > 0 && <span className="text-text-muted font-normal">({provider.ratingCount})</span>}
          </span>
        </div>

        {/* Service Details / Areas of Service */}
        {visibleAreas.length > 0 ? (
          <div className="space-y-1.5 pt-2 border-t border-border-subtle">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Areas of Service
            </p>
            <ul className="space-y-1">
              {visibleAreas.map((area, idx) => (
                <li key={`${area}-${idx}`} className="flex items-start gap-1.5 text-xs text-text-secondary">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{area}</span>
                </li>
              ))}
            </ul>
            {extraAreasCount > 0 && (
              <p className="text-[11px] text-accent-primary font-medium">+{extraAreasCount} more services</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed pt-2 border-t border-border-subtle">
            {provider.serviceDescription}
          </p>
        )}
      </div>

      <div className="space-y-2 pt-1">
        <ProviderContactGate
          canContact={isContactVisible}
          phoneNumber={provider.phoneNumber}
          whatsappNumber={provider.whatsappNumber}
          businessName={provider.businessName}
        />
        <Link
          href={`/providers/${provider.id}`}
          className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold text-accent-primary hover:bg-accent-primary/10 transition-colors flex items-center justify-center gap-1"
        >
          <span>View Business Card, Portfolio &amp; Reviews</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
