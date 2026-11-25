import { createDbClient } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors";
import { isSubscriptionActive } from "@/lib/contact-sanitizer";
import type { SubscriptionStatusDTO } from "@/types/domain";
import type { DbSubscription } from "@/types/database";

export const subscriptionService = {
  async getStatusByProviderId(providerId: string): Promise<SubscriptionStatusDTO> {
    const db = await createDbClient();
    const { data: subs } = await db
      .from("subscriptions")
      .select("*")
      .eq("provider_id", providerId)
      .order("current_period_end", { ascending: false });

    const latest = subs && subs.length > 0 ? (subs[0] as DbSubscription) : null;

    if (!latest) {
      // Mock active free trial for demonstration
      const start = new Date().toISOString();
      const end = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString();
      return {
        providerId,
        planType: "free_trial",
        status: "active",
        currentPeriodStart: start,
        currentPeriodEnd: end,
        daysRemaining: 25,
        isActive: true,
        canContact: true,
        renewalAmountNgn: 1000,
      };
    }

    const isActive = isSubscriptionActive({
      status: latest.status,
      currentPeriodEnd: latest.current_period_end,
    });

    const now = Date.now();
    const endMs = new Date(latest.current_period_end).getTime();
    const daysRemaining = isActive ? Math.max(0, Math.ceil((endMs - now) / (1000 * 60 * 60 * 24))) : 0;

    return {
      providerId,
      planType: latest.plan_type,
      status: latest.status,
      currentPeriodStart: latest.current_period_start,
      currentPeriodEnd: latest.current_period_end,
      daysRemaining,
      isActive,
      canContact: isActive,
      renewalAmountNgn: 1000,
    };
  },

  async extendSubscriptionFromPayment(params: {
    providerId: string;
    paystackReference: string;
    amountKobo: number;
  }) {
    const admin = createAdminClient();

    // Check payment event idempotency
    const { data: existingEvent } = await admin
      .from("payment_events")
      .select("*")
      .eq("paystack_reference", params.paystackReference)
      .single();

    if (existingEvent && existingEvent.status === "succeeded") {
      return { alreadyProcessed: true };
    }

    // Get current subscription to extend
    const { data: currentSubs } = await admin
      .from("subscriptions")
      .select("*")
      .eq("provider_id", params.providerId)
      .order("current_period_end", { ascending: false })
      .limit(1);

    const current = currentSubs?.[0] as DbSubscription | undefined;
    const now = new Date();

    // If current subscription is still active, extend from current end; otherwise from now
    let baseDate = now;
    if (current && new Date(current.current_period_end) > now) {
      baseDate = new Date(current.current_period_end);
    }

    const newPeriodEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    // Insert new monthly subscription
    const { data: newSub, error: subError } = await admin
      .from("subscriptions")
      .insert({
        provider_id: params.providerId,
        plan_type: "monthly_1000_ngn",
        amount_ngn: 1000,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: newPeriodEnd.toISOString(),
        paystack_reference: params.paystackReference,
      })
      .select()
      .single();

    if (subError) {
      throw new AppError(subError.message, 500, "SUBSCRIPTION_CREATION_ERROR");
    }

    // Log payment event for idempotency
    await admin.from("payment_events").upsert(
      {
        provider_id: params.providerId,
        subscription_id: newSub.id,
        paystack_reference: params.paystackReference,
        amount_ngn: 1000,
        currency: "NGN",
        status: "succeeded",
        processed_at: now.toISOString(),
      },
      { onConflict: "paystack_reference" }
    );

    return { alreadyProcessed: false, subscription: newSub };
  },

  async runZeroGraceExpiryCheck() {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    // Strictly find subscriptions where status = 'active' and current_period_end <= now
    const { data: expired, error } = await admin
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("status", "active")
      .lte("current_period_end", now)
      .select("id, provider_id");

    if (error) {
      throw new AppError(error.message, 500, "EXPIRY_CHECK_ERROR");
    }

    return { expiredCount: expired ? expired.length : 0 };
  },
};
