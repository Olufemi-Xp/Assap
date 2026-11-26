import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SubscriptionStatusCard } from "@/components/subscriptions/subscription-status-card";
import { PortfolioManager } from "@/components/portfolio/portfolio-manager";
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";
import { ProviderReviews } from "@/components/reviews/provider-reviews";
import { BusinessCardEditor } from "@/components/providers/business-card-editor";
import { subscriptionService } from "@/services/subscription-service";
import { providerService } from "@/services/provider-service";
import { portfolioService } from "@/services/portfolio-service";
import { getSessionContext } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PortfolioItemDTO } from "@/types/domain";
import {
  Star,
  PhoneCall,
  Sparkles,
  User as UserIcon,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Compass,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ trial?: string }>;
}) {
  const session = await getSessionContext();
  if (!session) {
    redirect("/auth/login?redirect=/provider/dashboard");
  }

  const [{ trial }, providerProfile] = await Promise.all([
    searchParams,
    providerService.getProviderByUserId(session.user.id),
  ]);

  const subStatus = providerProfile
    ? await subscriptionService.getStatusByProviderId(providerProfile.id)
    : null;

  let portfolioItems: PortfolioItemDTO[] = [];
  if (providerProfile) {
    try {
      portfolioItems = await portfolioService.listByProvider(providerProfile.id, session.user.id);
    } catch {
      portfolioItems = [];
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-[920px] mx-auto">
        {/* Dashboard Header with Profile & Public Listing Shortcuts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
              Service Provider Dashboard
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {providerProfile
                ? `${providerProfile.businessName} — manage your Service Business Card, portfolio, reviews, and subscription.`
                : `Welcome, ${session.fullName}. Set up your Service Business Card and identity record to start receiving local jobs.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {providerProfile && (
              <Link href={`/providers/${providerProfile.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public Profile</span>
                </Button>
              </Link>
            )}
            <Link href="/explore">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Compass className="w-3.5 h-3.5" />
                <span>Explore</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <UserIcon className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Trial Started Confirmation Banner */}
        {trial === "started" && (
          <Card className="p-4 border-status-success-border bg-status-success-bg/60 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-status-success-text flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-brand">
              You have successfully completed your profile setup as a service provider. Your 30-day free trial is now
              active!
            </p>
          </Card>
        )}

        {/* Incomplete KYC / Listing Setup Prompt */}
        {!providerProfile && (
          <Card className="p-5 sm:p-6 border-gold-brushed/50 bg-gold-pale/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-pale/40 text-brand flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-sm text-text-primary">
                  Complete Identity Verification &amp; Activation
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Capture your live selfie and valid government ID to activate your 30-day free trial, or configure your
                  Service Business Card below.
                </p>
              </div>
            </div>
            <Link href="/onboarding/kyc-capture?role=provider" className="flex-shrink-0">
              <Button size="sm" className="gap-1.5 w-full sm:w-auto">
                <span>Complete Identity Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        )}

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Contact Status</p>
              <p
                className={`font-bold text-sm ${
                  subStatus?.canContact ? "text-status-success-text" : "text-text-muted"
                }`}
              >
                {providerProfile
                  ? subStatus?.canContact
                    ? "Active & Visible"
                    : "Contact Hidden"
                  : "Pending Setup"}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-pale/25 text-gold flex items-center justify-center">
              <Star className="w-5 h-5 fill-gold" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Star Rating</p>
              <p className="font-bold text-sm text-text-primary tabular-nums">
                {providerProfile && providerProfile.ratingCount > 0
                  ? `★ ${providerProfile.averageRating.toFixed(2)} (${providerProfile.ratingCount} reviews)`
                  : "No reviews yet"}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-brand/10 text-indigo-brand flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Listing Tier</p>
              <p className="font-bold text-sm text-text-primary">
                {subStatus?.planType === "monthly_1000_ngn" ? "₦1,000/mo Plan" : "1st Month Free Trial"}
              </p>
            </div>
          </Card>
        </div>

        {/* Service Business Card & Areas of Service */}
        <BusinessCardEditor initialProvider={providerProfile} defaultName={session.fullName} />

        {/* Portfolio Management Module */}
        <PortfolioManager initialItems={portfolioItems} canManage={Boolean(providerProfile)} />

        {/* Live Customer-Facing Portfolio Preview (Before/After + Like, Comment, Share) */}
        {providerProfile && (
          <PortfolioGallery
            providerId={providerProfile.id}
            providerName={providerProfile.businessName}
            initialItems={portfolioItems}
            isSignedIn={true}
          />
        )}

        {/* Customer Reviews Overview */}
        {providerProfile && (
          <ProviderReviews
            providerId={providerProfile.id}
            initialRatings={providerProfile.ratings}
            initialAverage={providerProfile.averageRating}
            initialCount={providerProfile.ratingCount}
            canReview={false}
            viewerRole={session.role}
            viewerUserId={session.user.id}
          />
        )}

        {/* Subscription Control Card */}
        {subStatus && <SubscriptionStatusCard status={subStatus} />}
      </div>
    </AppShell>
  );
}
