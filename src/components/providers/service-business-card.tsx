import React from "react";
import { Card } from "@/components/ui/card";
import { formatLocation } from "@/lib/constants/nigeria-locations";
import { Briefcase, CheckCircle2, MapPin, Star, BadgeCheck } from "lucide-react";

export interface ServiceBusinessCardProps {
  businessName: string;
  serviceTitle: string;
  serviceCategory?: string;
  serviceAreas: string[];
  serviceDescription?: string;
  state?: string | null;
  city?: string | null;
  lga?: string | null;
  locationArea?: string | null;
  averageRating?: number;
  ratingCount?: number;
  imageUrl?: string | null;
  compact?: boolean;
}

export function ServiceBusinessCard({
  businessName,
  serviceTitle,
  serviceCategory,
  serviceAreas,
  serviceDescription,
  state,
  city,
  lga,
  locationArea,
  averageRating = 0,
  ratingCount = 0,
  imageUrl,
  compact = false,
}: ServiceBusinessCardProps) {
  const locationLabel = formatLocation({ state, city, lga });

  return (
    <Card
      className={`relative overflow-hidden border-border-subtle bg-surface ${
        compact ? "p-4 space-y-3" : "p-5 sm:p-6 space-y-4"
      }`}
    >
      {/* Top Teal-Blue-to-Indigo Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-secondary via-accent-primary to-indigo-brand" />

      {imageUrl && (
        <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden border border-border-subtle bg-slate-900 mt-1">
          <img
            src={imageUrl}
            alt={serviceTitle || businessName || "Public business card image"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Business Header */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary text-[11px] font-bold">
            <Briefcase className="w-3 h-3" />
            <span>{serviceTitle || "Service Provider"}</span>
          </div>
          <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand truncate flex items-center gap-1.5">
            <span className="truncate">{businessName || "Your Business Name"}</span>
            <BadgeCheck className="w-4 h-4 text-verified flex-shrink-0" aria-label="Verified provider" />
          </h3>
          {(locationArea || locationLabel) && (
            <p className="text-[11px] text-text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3 text-accent-primary flex-shrink-0" />
              <span className="truncate">
                {locationArea ? `${locationArea}${locationLabel ? " • " : ""}` : ""}
                {locationLabel}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-primary tabular-nums">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            {averageRating > 0 ? averageRating.toFixed(1) : "New"}
            {ratingCount > 0 && <span className="text-text-muted font-normal">({ratingCount})</span>}
          </span>
          {serviceCategory && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
              {serviceCategory.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Structured Areas of Service */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Areas of Service
        </p>
        {serviceAreas.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {serviceAreas.map((area, idx) => (
              <li
                key={`${area}-${idx}`}
                className="flex items-start gap-1.5 text-xs text-text-primary bg-canvas px-2.5 py-1.5 rounded-lg border border-border-warm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{area}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-muted italic">
            {serviceDescription || "No specific service areas listed yet."}
          </p>
        )}
      </div>

      {serviceDescription && serviceAreas.length > 0 && !compact && (
        <p className="text-xs text-text-secondary leading-relaxed pt-1 border-t border-border-subtle/60">
          {serviceDescription}
        </p>
      )}
    </Card>
  );
}
