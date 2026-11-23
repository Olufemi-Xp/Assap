import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProviderContactGate } from "./provider-contact-gate";
import type { ProviderListItemDTO } from "@/types/domain";
import { Star } from "lucide-react";

export interface ProviderCardProps {
  provider: ProviderListItemDTO;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const isContactVisible = provider.canContact;

  return (
    <Card hoverable className="flex flex-col justify-between h-full p-5 space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/providers/${provider.id}`}
              className="font-heading font-bold text-base text-text-primary hover:text-accent-primary transition-colors line-clamp-1"
            >
              {provider.businessName}
            </Link>
            <p className="text-xs text-text-muted capitalize">
              {provider.serviceCategory} • {provider.locationArea}, {provider.state}
            </p>
          </div>

          <span className="flex items-center gap-1 text-xs font-semibold text-text-primary tabular-nums">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {provider.averageRating > 0 ? provider.averageRating.toFixed(1) : "New"}
            {provider.ratingCount > 0 && <span className="text-text-muted font-normal">({provider.ratingCount})</span>}
          </span>
        </div>

        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
          {provider.serviceDescription}
        </p>
      </div>

      <ProviderContactGate
        canContact={isContactVisible}
        phoneNumber={provider.phoneNumber}
        whatsappNumber={provider.whatsappNumber}
        businessName={provider.businessName}
      />
    </Card>
  );
}
