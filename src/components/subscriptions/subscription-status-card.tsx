"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatusDTO } from "@/types/domain";

export interface SubscriptionStatusCardProps {
  status: SubscriptionStatusDTO;
}

export function SubscriptionStatusCard({ status }: SubscriptionStatusCardProps) {
  const [isPaying, setIsPaying] = useState(false);

  const handlePayRenewal = async () => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: status.providerId }),
      });
      const json = await res.json();
      if (json.ok && json.data?.authorization_url) {
        window.location.href = json.data.authorization_url;
      }
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Card className="p-6 space-y-5 border border-border-subtle bg-surface">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading font-bold text-base text-text-primary">
            Listing subscription
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {status.planType === "free_trial" ? "First month free trial" : "₦1,000 monthly plan"}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
            status.isActive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          }`}
        >
          {status.isActive ? "Contacts visible" : "Contacts hidden"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 py-3 border-y border-border-subtle text-xs">
        <div>
          <span className="text-text-muted block">Days remaining</span>
          <span className="font-semibold text-sm text-text-primary tabular-nums mt-0.5 block">
            {status.daysRemaining} days
          </span>
        </div>
        <div>
          <span className="text-text-muted block">Renewal fee</span>
          <span className="font-semibold text-sm text-text-primary tabular-nums mt-0.5 block">
            ₦1,000 / month
          </span>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">
        Phone and WhatsApp buttons are visible to customers while a subscription is active. When a period ends without renewal, contacts are hidden immediately.
      </p>

      <Button
        onClick={handlePayRenewal}
        isLoading={isPaying}
        className="w-full font-medium"
      >
        Renew for ₦1,000 with Paystack
      </Button>
    </Card>
  );
}
