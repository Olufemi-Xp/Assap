import { AppShell } from "@/components/layout/app-shell";
import { SubscriptionStatusCard } from "@/components/subscriptions/subscription-status-card";
import { subscriptionService } from "@/services/subscription-service";
import { Card } from "@/components/ui/card";
import { Wrench, Star, PhoneCall, Sparkles } from "lucide-react";

export default async function ProviderDashboardPage() {
  const providerId = "pr000000-0000-0000-0000-000000000001";
  const subStatus = await subscriptionService.getStatusByProviderId(providerId);

  return (
    <AppShell>
      <div className="space-y-6 max-w-[900px] mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
            Service Provider Workspace
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Track your listing visibility, customer contact reach, and ₦1,000/month subscription.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Contact Status</p>
              <p className="font-bold text-sm text-status-success-text">Active & Visible</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Star Rating</p>
              <p className="font-bold text-sm text-text-primary">★ 4.85 (12 reviews)</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Listing Tier</p>
              <p className="font-bold text-sm text-text-primary">1st Month Free Trial</p>
            </div>
          </Card>
        </div>

        {/* Subscription Control Card */}
        <SubscriptionStatusCard status={subStatus} />
      </div>
    </AppShell>
  );
}
