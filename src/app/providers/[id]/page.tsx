import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { providerService } from "@/services/provider-service";
import { ProviderContactGate } from "@/components/providers/provider-contact-gate";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = await providerService.getProviderById(id);

  if (!provider) {
    notFound();
  }

  const isContactVisible = provider.canContact;

  return (
    <AppShell>
      <div className="max-w-[720px] mx-auto space-y-6">
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
                  {provider.businessName}
                </h1>
                <p className="text-xs text-text-muted capitalize mt-1">
                  {provider.serviceCategory} • {provider.locationArea}, {provider.state}
                </p>
              </div>

              <span className="flex items-center gap-1 text-sm font-semibold text-text-primary tabular-nums">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {provider.averageRating > 0 ? provider.averageRating.toFixed(2) : "New"}
                {provider.ratingCount > 0 && <span className="text-text-muted font-normal text-xs">({provider.ratingCount})</span>}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <h2 className="text-sm font-semibold text-text-primary">Services offered</h2>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {provider.serviceDescription}
            </p>
          </div>

          <div className="pt-2 border-t border-border-subtle space-y-2">
            <h2 className="text-xs font-medium text-text-muted">Direct contact</h2>
            <ProviderContactGate
              canContact={isContactVisible}
              phoneNumber={provider.phoneNumber}
              whatsappNumber={provider.whatsappNumber}
              businessName={provider.businessName}
            />
          </div>
        </Card>

        {/* Reviews Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-heading font-bold text-text-primary">
            Customer reviews ({provider.ratings.length})
          </h2>

          {provider.ratings.length === 0 ? (
            <p className="text-xs text-text-muted">No reviews recorded yet for this provider.</p>
          ) : (
            <div className="space-y-3">
              {provider.ratings.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary">{r.customerName}</span>
                    <span className="flex items-center gap-0.5 text-text-primary font-semibold tabular-nums">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {r.stars}
                    </span>
                  </div>
                  {r.comment && <p className="text-xs text-text-secondary">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
