import { AppShell } from "@/components/layout/app-shell";
import { SubscriptionStatusCard } from "@/components/subscriptions/subscription-status-card";
import { subscriptionService } from "@/services/subscription-service";

export default async function ProviderSubscriptionPage() {
  const providerId = "pr000000-0000-0000-0000-000000000001";
  const subStatus = await subscriptionService.getStatusByProviderId(providerId);

  return (
    <AppShell>
      <div className="max-w-[600px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Subscription & Billing
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your ₦1,000/month Paystack subscription.
          </p>
        </div>

        <SubscriptionStatusCard status={subStatus} />
      </div>
    </AppShell>
  );
}
