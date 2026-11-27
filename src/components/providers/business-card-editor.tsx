"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationSelector } from "@/components/location/location-selector";
import { ServiceAreasEditor } from "@/components/providers/service-areas-editor";
import { ServiceBusinessCard } from "@/components/providers/service-business-card";
import { SERVICE_CATEGORIES } from "@/lib/constants/service-categories";
import { normalizeLocation, type SelectedLocation } from "@/lib/constants/nigeria-locations";
import type { ProviderDetailDTO } from "@/types/domain";
import { Briefcase, Save, CheckCircle2, AlertCircle, Eye, Pencil, X } from "lucide-react";

export interface BusinessCardEditorProps {
  initialProvider: ProviderDetailDTO | null;
  defaultName: string;
}

export function BusinessCardEditor({ initialProvider, defaultName }: BusinessCardEditorProps) {
  const router = useRouter();

  const initialLoc =
    normalizeLocation({
      state: initialProvider?.state || "lagos",
      city: initialProvider?.city || "",
      lga: initialProvider?.lga || "",
    }) || { state: "lagos", city: "", lga: "" };

  const [businessName, setBusinessName] = useState(initialProvider?.businessName || defaultName || "");
  const [serviceTitle, setServiceTitle] = useState(
    initialProvider?.serviceTitle || "Service Provider"
  );
  const [serviceCategory, setServiceCategory] = useState<string>(
    initialProvider?.serviceCategory || "electrician"
  );
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    initialProvider?.serviceAreas || []
  );
  const [serviceDescription, setServiceDescription] = useState(
    initialProvider?.serviceDescription || ""
  );
  const [location, setLocation] = useState<SelectedLocation>(initialLoc);
  const [locationArea, setLocationArea] = useState(initialProvider?.locationArea || "");
  const [phoneNumber, setPhoneNumber] = useState(initialProvider?.phoneNumber || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialProvider?.whatsappNumber || "");

  const [isEditing, setIsEditing] = useState(!initialProvider);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (serviceAreas.length === 0) {
      setError("Add at least one specific service area or task on your Service Business Card.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/provider/business-card", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          serviceTitle,
          serviceCategory,
          serviceAreas,
          serviceDescription,
          state: location.state || "lagos",
          city: location.city || null,
          lga: location.lga || null,
          locationArea,
          phoneNumber,
          whatsappNumber: whatsappNumber || phoneNumber,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to save and publish Service Business Card");
      }

      if (json.data?.provider) {
        const saved = json.data.provider as ProviderDetailDTO;
        setBusinessName(saved.businessName);
        setServiceTitle(saved.serviceTitle);
        setServiceAreas(saved.serviceAreas);
        setLocationArea(saved.locationArea);
        if (saved.phoneNumber) setPhoneNumber(saved.phoneNumber);
        if (saved.whatsappNumber) setWhatsappNumber(saved.whatsappNumber);
      }

      setIsEditing(false);
      setSuccess("Saved and published! Your Service Business Card is live for customers.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-heading font-bold text-text-primary flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-accent-primary" />
            <span>Service Business Card</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Define your service title and the exact tasks you handle. Customers see this card when searching services.
          </p>
        </div>

        <Button
          type="button"
          variant={isEditing ? "outline" : "secondary"}
          size="sm"
          onClick={() => {
            setError(null);
            setIsEditing((prev) => !prev);
          }}
          className="gap-1.5 flex-shrink-0 self-start sm:self-auto"
        >
          {isEditing ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Close Editor</span>
            </>
          ) : (
            <>
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </>
          )}
        </Button>
      </div>

      {success && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-status-success-bg/60 border border-status-success-border text-xs font-semibold text-status-success-text flex items-start gap-2"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Live Customer Preview */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-accent-primary" />
          <span>Live Customer Card Preview</span>
        </p>
        <ServiceBusinessCard
          businessName={businessName}
          serviceTitle={serviceTitle}
          serviceCategory={serviceCategory}
          serviceAreas={serviceAreas}
          serviceDescription={serviceDescription}
          state={location.state}
          city={location.city}
          lga={location.lga}
          locationArea={locationArea}
          averageRating={initialProvider?.averageRating || 0}
          ratingCount={initialProvider?.ratingCount || 0}
        />
      </div>

      {/* Editor Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-border-subtle">
          {error && (
            <div className="p-3 rounded-xl bg-status-danger-bg/50 border border-status-danger-border text-xs text-status-danger-text flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Business / Brand Name"
              placeholder="e.g. Teniola Bespoke Tailoring"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <Input
              label="Service Title"
              placeholder="e.g. Fashion Designer, Electrician, Plumber"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="bc-category" className="block text-xs font-semibold text-text-primary mb-1">
              Trade Category
            </label>
            <select
              id="bc-category"
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary text-xs font-medium min-h-tap"
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Structured Service Areas Editor */}
          <ServiceAreasEditor
            value={serviceAreas}
            onChange={setServiceAreas}
            category={serviceCategory}
          />

          {/* Location */}
          <LocationSelector value={location} onChange={setLocation} compact />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Town / Neighborhood (optional)"
              placeholder="e.g. Yaba, Ikeja, Wuse"
              value={locationArea}
              onChange={(e) => setLocationArea(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="08012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <Input
              label="WhatsApp Number (optional)"
              placeholder="Same as phone if blank"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
          </div>

          <Input
            label="Short Bio / Additional Note (optional)"
            placeholder="e.g. 8 years experience, fast response across Lagos Mainland"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
          />

          <Button type="submit" isLoading={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            <span>Save and Publish</span>
          </Button>
        </form>
      )}
    </Card>
  );
}
