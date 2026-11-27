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
import { Briefcase, Save, CheckCircle2, AlertCircle, Eye, Pencil, X, ImagePlus, Trash2 } from "lucide-react";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
  const [imageUrl, setImageUrl] = useState<string | null>(initialProvider?.imageUrl || null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isEditing, setIsEditing] = useState(!initialProvider);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const displayImageUrl = localPreviewUrl || imageUrl;

  const compressImageToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const maxDim = 900;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        URL.revokeObjectURL(objectUrl);
        if (!ctx) {
          reject(new Error("Could not process image"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not read image file"));
      };
      img.src = objectUrl;
    });

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setError(null);
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Public business card image must be a JPG, PNG, or WebP file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Public business card image must be 5 MB or smaller.");
      return;
    }

    // Show immediate visible preview of the actual selected image
    const immediatePreview = URL.createObjectURL(file);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return immediatePreview;
    });

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/provider/business-card/image", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.ok && json.data?.url) {
        setImageUrl(json.data.url as string);
        setLocalPreviewUrl(null);
        URL.revokeObjectURL(immediatePreview);
      } else {
        // Fallback to compact JPEG data URL if storage bucket upload fails
        const dataUrl = await compressImageToDataUrl(file);
        setImageUrl(dataUrl);
        setLocalPreviewUrl(null);
        URL.revokeObjectURL(immediatePreview);
      }
    } catch {
      try {
        const dataUrl = await compressImageToDataUrl(file);
        setImageUrl(dataUrl);
        setLocalPreviewUrl(null);
        URL.revokeObjectURL(immediatePreview);
      } catch (err) {
        setError((err as Error).message);
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

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
          imageUrl,
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
        setImageUrl(saved.imageUrl || null);
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
          imageUrl={displayImageUrl}
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

          {/* Public Business Card Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-primary">
              Public Business Card Image
            </label>
            <p className="text-[11px] text-text-muted">
              Upload the image customers see on the front of your Service Business Card in the Trade Directory (JPG, PNG, or WebP, max 5 MB).
            </p>
            <div className="rounded-xl border border-dashed border-border-subtle bg-surface-subtle/40 p-4 space-y-3">
              {displayImageUrl ? (
                <div className="space-y-3">
                  <div className="relative w-full h-44 rounded-lg overflow-hidden border border-border-subtle bg-slate-900">
                    <img
                      src={displayImageUrl}
                      alt="Public business card preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface text-xs font-semibold text-text-primary hover:border-accent-primary cursor-pointer transition-colors">
                      <ImagePlus className="w-3.5 h-3.5 text-accent-primary" />
                      <span>{isUploadingImage ? "Uploading..." : "Replace Image"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isUploadingImage}
                        onChange={(e) => {
                          handleImageUpload(e.target.files?.[0] || null);
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageUrl(null);
                        setLocalPreviewUrl((prev) => {
                          if (prev) URL.revokeObjectURL(prev);
                          return null;
                        });
                      }}
                      disabled={isUploadingImage}
                      className="gap-1.5 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-4 cursor-pointer text-center space-y-1.5">
                  <ImagePlus className="w-6 h-6 text-accent-primary" />
                  <span className="text-xs font-semibold text-text-primary">
                    {isUploadingImage ? "Uploading image..." : "Click to upload Public Business Card Image"}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    JPG, PNG, or WebP up to 5 MB (optional fallback used if empty)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isUploadingImage}
                    onChange={(e) => {
                      handleImageUpload(e.target.files?.[0] || null);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <Button type="submit" isLoading={isSaving || isUploadingImage} className="gap-2">
            <Save className="w-4 h-4" />
            <span>Save and Publish</span>
          </Button>
        </form>
      )}
    </Card>
  );
}
