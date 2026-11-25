"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortfolioItemDTO } from "@/types/domain";
import {
  Briefcase,
  Plus,
  Trash2,
  Heart,
  MessageCircle,
  Share2,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface PortfolioManagerProps {
  initialItems: PortfolioItemDTO[];
  canManage: boolean;
}

export function PortfolioManager({ initialItems, canManage }: PortfolioManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItemDTO[]>(initialItems);
  const [title, setTitle] = useState("");
  const [deliveryStory, setDeliveryStory] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [completedOn, setCompletedOn] = useState("");
  const [duration, setDuration] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = (kind: "before" | "after", file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (kind === "before") {
      setBeforeFile(file);
      setBeforePreview(url);
    } else {
      setAfterFile(file);
      setAfterPreview(url);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDeliveryStory("");
    setJobLocation("");
    setCompletedOn("");
    setDuration("");
    setExtraDetails("");
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(null);
    setAfterPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!beforeFile && !afterFile) {
      setError("Please upload at least one Before or After photo of the delivered job.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("deliveryStory", deliveryStory);
      if (jobLocation.trim()) formData.append("jobLocation", jobLocation.trim());
      if (completedOn.trim()) formData.append("completedOn", completedOn.trim());
      if (duration.trim()) formData.append("duration", duration.trim());
      if (extraDetails.trim()) formData.append("extraDetails", extraDetails.trim());
      if (beforeFile) formData.append("beforeImage", beforeFile);
      if (afterFile) formData.append("afterImage", afterFile);

      const res = await fetch("/api/portfolio", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to publish portfolio item");
      }

      setItems((prev) => [json.data.item, ...prev]);
      resetForm();
      setSuccess("Portfolio job published! Customers can now view, like, comment, and share it.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId);
    setError(null);
    try {
      const res = await fetch(`/api/portfolio/${itemId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error?.message || "Could not delete item");
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Delivered Job Form */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-bold text-text-primary flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-accent-primary" />
              <span>Delivered Job History &amp; Portfolio</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Showcase completed jobs with before/after photos and delivery stories to build customer trust.
            </p>
          </div>
        </div>

        {!canManage ? (
          <div className="p-4 rounded-xl bg-status-warning-bg/40 border border-status-warning-border text-xs text-status-warning-text">
            Complete your Service Provider profile &amp; KYC setup above to unlock publishing portfolio jobs.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-status-danger-bg/50 border border-status-danger-border text-xs text-status-danger-text flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-status-success-bg/50 border border-status-success-border text-xs text-status-success-text flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <Input
              label="Work Title"
              placeholder="e.g. Full Bathroom Pipe Replacement & Pressure Testing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={140}
            />

            <div>
              <label htmlFor="delivery-story" className="block text-sm font-medium text-text-primary mb-1.5">
                Delivery Story <span className="text-red-500">*</span>
              </label>
              <textarea
                id="delivery-story"
                rows={3}
                required
                minLength={20}
                maxLength={3000}
                value={deliveryStory}
                onChange={(e) => setDeliveryStory(e.target.value)}
                placeholder="Explain the problem you found, how you solved it, materials used, and the final result..."
                className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            {/* Before & After Image Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block rounded-xl border border-dashed border-border-subtle hover:border-accent-primary p-4 text-center cursor-pointer bg-surface-subtle/40 transition-colors space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                  <ImagePlus className="w-4 h-4 text-accent-primary" /> Before Photo
                </span>
                {beforePreview ? (
                  <img
                    src={beforePreview}
                    alt="Before preview"
                    className="w-full h-36 object-cover rounded-lg border border-border-subtle"
                  />
                ) : (
                  <p className="text-[11px] text-text-muted py-6">Click to upload JPG/PNG/WebP (max 5MB)</p>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileSelect("before", e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <label className="block rounded-xl border border-dashed border-border-subtle hover:border-accent-primary p-4 text-center cursor-pointer bg-surface-subtle/40 transition-colors space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                  <ImagePlus className="w-4 h-4 text-emerald-600" /> After Photo
                </span>
                {afterPreview ? (
                  <img
                    src={afterPreview}
                    alt="After preview"
                    className="w-full h-36 object-cover rounded-lg border border-border-subtle"
                  />
                ) : (
                  <p className="text-[11px] text-text-muted py-6">Click to upload JPG/PNG/WebP (max 5MB)</p>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileSelect("after", e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Supporting Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Job Location (optional)"
                placeholder="e.g. Yaba, Lagos"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
              />
              <Input
                label="Completed Date (optional)"
                type="date"
                value={completedOn}
                onChange={(e) => setCompletedOn(e.target.value)}
              />
              <Input
                label="Duration (optional)"
                placeholder="e.g. 4 hours"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <Input
              label="Materials / Additional Notes (optional)"
              placeholder="e.g. Used Tiger PPR pipes and pressure-tested at 6 bar"
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
            />

            <Button type="submit" isLoading={isSubmitting} className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Publish Portfolio Item</span>
            </Button>
          </form>
        )}
      </Card>

      {/* Existing Portfolio Items List */}
      {items.length > 0 && (
        <Card className="p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-heading font-bold text-text-primary">
            Published Portfolio Work ({items.length})
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border-subtle bg-surface-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <p className="font-heading font-bold text-sm text-text-primary truncate">{item.title}</p>
                  <p className="text-xs text-text-secondary line-clamp-2">{item.deliveryStory}</p>
                  <div className="flex items-center gap-4 pt-1 text-[11px] text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" /> {item.likeCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-accent-primary" /> {item.commentCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Share2 className="w-3 h-3" /> {item.shareCount}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  isLoading={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="gap-1.5 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
