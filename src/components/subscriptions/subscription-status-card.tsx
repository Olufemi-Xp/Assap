"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatusDTO } from "@/types/domain";
import { AlertCircle, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

function loadPaystackInlineScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser unavailable"));
  if (window.PaystackPop) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.paystack.co/v1/inline.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack checkout script.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack checkout script."));
    document.body.appendChild(script);
  });
}

export interface SubscriptionStatusCardProps {
  status: SubscriptionStatusDTO;
  providerEmail?: string;
  initialNotice?: { type: "success" | "error"; message: string } | null;
}

export function SubscriptionStatusCard({
  status: initialStatus,
  providerEmail,
  initialNotice = null,
}: SubscriptionStatusCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<SubscriptionStatusDTO>(initialStatus);
  const [isPaying, setIsPaying] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(
    initialNotice
  );

  const verifyPaymentReference = async (reference: string) => {
    setIsPaying(true);
    setNotice(null);
    try {
      const res = await fetch("/api/subscriptions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, providerId: status.providerId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Payment verification failed.");
      }
      if (json.data?.status) {
        setStatus(json.data.status as SubscriptionStatusDTO);
      }
      setNotice({
        type: "success",
        message: "Payment successful! Your ₦1,000 monthly subscription is now active.",
      });
      router.refresh();
    } catch (err) {
      setNotice({
        type: "error",
        message: (err as Error).message || "Could not verify payment.",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handlePayRenewal = async () => {
    setIsPaying(true);
    setNotice(null);
    try {
      const res = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: status.providerId,
          email: providerEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error?.message || "Could not start Paystack checkout.");
      }

      if (json.data.mode === "hosted" && json.data.authorization_url) {
        window.location.href = json.data.authorization_url;
        return;
      }

      if (json.data.mode === "inline" && json.data.publicKey) {
        await loadPaystackInlineScript();
        if (!window.PaystackPop) {
          throw new Error("Paystack checkout could not be initialized in this browser.");
        }

        const handler = window.PaystackPop.setup({
          key: json.data.publicKey,
          email: json.data.email,
          amount: json.data.amountKobo || 100000,
          currency: "NGN",
          ref: json.data.reference,
          metadata: {
            providerId: status.providerId,
            planType: "monthly_1000_ngn",
          },
          callback: (response) => {
            void verifyPaymentReference(response.reference);
          },
          onClose: () => {
            setIsPaying(false);
            setNotice({
              type: "error",
              message: "Paystack checkout was closed before payment was completed.",
            });
          },
        });

        handler.openIframe();
        return;
      }

      throw new Error("Paystack returned an unexpected checkout response.");
    } catch (err) {
      setNotice({
        type: "error",
        message: (err as Error).message || "Unable to connect to Paystack.",
      });
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

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
            notice.type === "success"
              ? "bg-status-success-bg/50 border-status-success-border text-status-success-text"
              : "bg-status-danger-bg/50 border-status-danger-border text-status-danger-text"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

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
        type="button"
        onClick={handlePayRenewal}
        isLoading={isPaying}
        className="w-full font-medium"
      >
        Renew for ₦1,000 with Paystack
      </Button>
    </Card>
  );
}
