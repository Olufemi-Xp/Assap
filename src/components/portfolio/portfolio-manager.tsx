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
  Pencil,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";

export interface PortfolioManagerProps {
  initialItems: PortfolioItemDTO[];
  canManage: boolean;
}

export function PortfolioManager({ initialItems, canManage }: PortfolioManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItemDTO[]>(initialItems);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [deliveryStory, setDeliveryStory] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [completedOn, setCompletedOn] = useState("");
  const [duration, setDuration] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setEditingItemId(null);
    setTitle("");
    setDeliveryStory("");
    setJobLocation("");
    setCompletedOn("");
    setDuration("");
    setExtraDetails("");
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleStartEdit = (item: PortfolioItemDTO) => {
    setError(null);
    setSuccess(null);
    setEditingItemId(item.id);
    setTitle(item.title);
    setDeliveryStory(item.deliveryStory);
    setJobLocation(item.jobLocation || "");
    setCompletedOn(item.completedOn || "");
    setDuration(item.duration || "");
    setExtraDetails(item.extraDetails || "");
    setPhotoFile(null);
    setPhotoPreview(item.afterImageUrl || item.beforeImageUrl || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (editingItemId) {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/portfolio/${editingItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            deliveryStory,
            jobLocation: jobLocation.trim() || null,
            completedOn: completedOn.trim() || null,
            duration: duration.trim() || null,
            extraDetails: extraDetails.trim() || null,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json.error?.message || "Failed to update portfolio item");
        }
        setItems((prev) =>
          prev.map((it) => (it.id === editingItemId ? { ...it, ...json.data.item } : it))
        );
        resetForm();
        setSuccess("Portfolio item saved and published!");
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!photoFile) {
      setError("Please upload a photo of the delivered job.");
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
      formData.append("afterImage", photoFile);

      const res = await fetch("/api/portfolio", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to publish portfolio item");
      }

      setItems((prev) => [json.data.item, ...prev]);
      resetForm();
      setSuccess("Portfolio job saved and published! Customers can now view it.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (item: PortfolioItemDTO) => {
    const currentVisible = item.isVisible !== false;
    const nextVisible = !currentVisible;
    setTogglingId(item.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/portfolio/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextVisible }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Could not update visibility");
      }
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isVisible: nextVisible } : it))
      );
      setSuccess(
        nextVisible
          ? `"${item.title}" is now ON and visible publicly to customers.`
          : `"${item.title}" is now OFF and hidden from customers.`
      );
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTogglingId(null);
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
      if (editingItemId === itemId) resetForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add / Edit Delivered Job Form */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-bold text-text-primary flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-accent-primary" />
              <span>Delivered Job History &amp; Portfolio</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Showcase completed jobs with a job photo and delivery story to build customer trust.
            </p>
          </div>
          {editingItemId && (
            <Button type="button" variant="outline" size="sm" onClick={resetForm} className="gap-1.5">
              <X className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </Button>
          )}
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

            {/* Single Image Window */}
            <label className="block rounded-xl border border-dashed border-border-subtle hover:border-accent-primary p-4 text-center cursor-pointer bg-surface-subtle/40 transition-colors space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                <ImagePlus className="w-4 h-4 text-accent-primary" /> Job Photo
              </span>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Job preview"
                  className="w-full max-h-60 object-cover rounded-lg border border-border-subtle"
                />
              ) : (
                <p className="text-[11px] text-text-muted py-6">Click to upload JPG/PNG/WebP (max 5MB)</p>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

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
              {editingItemId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingItemId ? "Save and Publish Changes" : "Save and Publish Portfolio Item"}</span>
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
            {items.map((item) => {
              const isPublic = item.isVisible !== false;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border-subtle bg-surface-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold text-sm text-text-primary truncate">
                        {item.title}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPublic
                            ? "bg-status-success-bg/70 text-status-success-text"
                            : "bg-surface-subtle text-text-muted border border-border-subtle"
                        }`}
                      >
                        {isPublic ? "On" : "Off"}
                      </span>
                    </div>
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

                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant={isPublic ? "secondary" : "outline"}
                      size="sm"
                      isLoading={togglingId === item.id}
                      onClick={() => handleToggleVisibility(item)}
                      aria-pressed={isPublic}
                      className="gap-1.5"
                    >
                      {isPublic ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-accent-primary" />
                          <span>On</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Off</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(item)}
                      className="gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      isLoading={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
