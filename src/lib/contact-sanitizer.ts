/**
 * Contact Sanitizer & Zero-Grace-Period Evaluator
 * 
 * Strict business rule:
 * When a provider's free 1st month or paid ₦1,000/month subscription is active (current_period_end > now()),
 * their direct phone and WhatsApp contact controls are exposed.
 * 
 * When expired or unpaid (current_period_end <= now()), with ZERO grace period,
 * phone_number and whatsapp_number are completely stripped at the server layer.
 */

export interface SubscriptionCheck {
  status: "active" | "expired" | "pending_payment" | "cancelled" | string;
  currentPeriodEnd: string | Date;
  planType?: string;
}

export function isSubscriptionActive(subscription?: SubscriptionCheck | null): boolean {
  if (!subscription) return false;
  if (subscription.status !== "active") return false;

  const expiry = new Date(subscription.currentPeriodEnd).getTime();
  const now = Date.now();

  // Strict zero grace period: expires the exact millisecond current_period_end passes
  return expiry > now;
}

export function sanitizeProviderContact<T extends { phoneNumber?: string | null; whatsappNumber?: string | null }>(
  provider: T,
  subscription?: SubscriptionCheck | null
): Omit<T, "phoneNumber" | "whatsappNumber"> & {
  canContact: boolean;
  phoneNumber?: string;
  whatsappNumber?: string;
  subscriptionStatusBadge: "trial_active" | "paid_active" | "contact_hidden";
} {
  const active = isSubscriptionActive(subscription);

  if (active) {
    const isTrial = (subscription as { planType?: string })?.planType === "free_trial";
    return {
      ...provider,
      canContact: true,
      phoneNumber: provider.phoneNumber ?? undefined,
      whatsappNumber: provider.whatsappNumber ?? undefined,
      subscriptionStatusBadge: isTrial ? "trial_active" : "paid_active",
    };
  }

  // Sanitize: strip phone and whatsapp completely
  const { phoneNumber: _p, whatsappNumber: _w, ...safeProvider } = provider;
  return {
    ...safeProvider,
    canContact: false,
    subscriptionStatusBadge: "contact_hidden",
  };
}
