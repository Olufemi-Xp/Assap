import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SubscriptionStatusCard } from "@/components/subscriptions/subscription-status-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionContext } from "@/lib/auth/session";
import { paystackService } from "@/services/paystack-service";
import { providerService } from "@/services/provider-service";
import { subscriptionService } from "@/services/subscription-service";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const session = await getSessionContext();
  if (!session) {
    redirect("/auth/login?redirect=/provider/subscription");
  }

  const [{ reference }, providerProfile] = await Promise.all([
    searchParams,
    providerService.getProviderByUserId(session.user.id),
  ]);

  if (!providerProfile) {
    return (
      <AppShell>
        <div className="max-w-[600px] mx-auto space-y-6">
          <Link href="/provider/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <Card className="p-6 space-y-3">
            <h1 className="text-xl font-heading font-bold text-text-primary">
              Complete your Service Business Card first
            </h1>
            <p className="text-xs text-text-secondary">
              Save your Service Business Card on the provider dashboard before managing your ₦1,000/month subscription.
            </p>
            <Link href="/provider/dashboard">
              <Button size="sm">Go to Provider Dashboard</Button>
            </Link>
          </Card>
        </div>
      </AppShell>
    );
  }

  let initialNotice: { type: "success" | "error"; message: string } | null = null;
  if (reference) {
    try {
      const verification = await paystackService.verifyTransaction(reference);
      if (verification.verified && verification.amountKobo >= 100000) {
        await subscriptionService.extendSubscriptionFromPayment({
          providerId: providerProfile.id,
          paystackReference: reference,
          amountKobo: verification.amountKobo,
        });
        initialNotice = {
          type: "success",
          message: "Payment verified! Your ₦1,000 monthly subscription has been extended.",
        };
      }
    } catch (err) {
      initialNotice = {
        type: "error",
        message: (err as Error).message || "Could not verify Paystack payment reference.",
      };
    }
  }

  const subStatus = await subscriptionService.getStatusByProviderId(providerProfile.id);

  return (
    <AppShell>
      <div className="max-w-[600px] mx-auto space-y-6">
        <Link href="/provider/dashboard">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Subscription &amp; Billing
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your ₦1,000/month Paystack subscription.
          </p>
        </div>

        <SubscriptionStatusCard
          status={subStatus}
          providerEmail={session.user.email || undefined}
          initialNotice={initialNotice}
        />
      </div>
    </AppShell>
  );
}
