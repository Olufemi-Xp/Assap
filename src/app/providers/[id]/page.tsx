import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { providerService } from "@/services/provider-service";
import { portfolioService } from "@/services/portfolio-service";
import { getSessionContext } from "@/lib/auth/session";
import { UUID_RE } from "@/lib/api-response";
import { ProviderContactGate } from "@/components/providers/provider-contact-gate";
import { ServiceBusinessCard } from "@/components/providers/service-business-card";
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";
import { ProviderReviews } from "@/components/reviews/provider-reviews";
import { Card } from "@/components/ui/card";
import type { PortfolioItemDTO } from "@/types/domain";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [provider, session] = await Promise.all([
    providerService.getProviderById(id),
    getSessionContext(),
  ]);

  if (!provider) {
    notFound();
  }

  let portfolioItems: PortfolioItemDTO[] = [];
  if (UUID_RE.test(id)) {
    try {
      portfolioItems = await portfolioService.listByProvider(id, session?.user.id ?? null);
    } catch {
      portfolioItems = [];
    }
  }

  const canReview =
    Boolean(session) &&
    session!.role === "customer" &&
    session!.user.id !== provider.userId &&
    UUID_RE.test(id);

  return (
    <AppShell>
      <div className="max-w-[780px] mx-auto space-y-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Search Services</span>
        </Link>

        {/* Service Business Card */}
        <ServiceBusinessCard
          businessName={provider.businessName}
          serviceTitle={provider.serviceTitle}
          serviceCategory={provider.serviceCategory}
          serviceAreas={provider.serviceAreas}
          serviceDescription={provider.serviceDescription}
          state={provider.state}
          city={provider.city}
          lga={provider.lga}
          locationArea={provider.locationArea}
          averageRating={provider.averageRating}
          ratingCount={provider.ratingCount}
        />

        {/* Direct Contact Gate */}
        <Card className="p-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Direct Contact</h2>
          <ProviderContactGate
            canContact={provider.canContact}
            phoneNumber={provider.phoneNumber}
            whatsappNumber={provider.whatsappNumber}
            businessName={provider.businessName}
          />
        </Card>

        {/* Delivered Job History / Portfolio Module */}
        <PortfolioGallery
          providerId={provider.id}
          providerName={provider.businessName}
          initialItems={portfolioItems}
          isSignedIn={Boolean(session)}
        />

        {/* Customer Review Module */}
        <ProviderReviews
          providerId={provider.id}
          initialRatings={provider.ratings}
          initialAverage={provider.averageRating}
          initialCount={provider.ratingCount}
          canReview={canReview}
          viewerRole={session?.role ?? null}
          viewerUserId={session?.user.id ?? null}
        />
      </div>
    </AppShell>
  );
}
