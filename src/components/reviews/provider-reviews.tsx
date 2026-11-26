"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";

export interface ReviewItem {
  id: string;
  customerId: string;
  customerName: string;
  stars: number;
  comment: string | null;
  createdAt: string;
}

export interface ProviderReviewsProps {
  providerId: string;
  initialRatings: ReviewItem[];
  initialAverage: number;
  initialCount: number;
  canReview: boolean;
  viewerRole: string | null;
  viewerUserId: string | null;
}

export function ProviderReviews({
  providerId,
  initialRatings,
  initialAverage,
  initialCount,
  canReview,
  viewerRole,
  viewerUserId,
}: ProviderReviewsProps) {
  const existingViewerReview = viewerUserId
    ? initialRatings.find((r) => r.customerId === viewerUserId)
    : undefined;

  const [ratings, setRatings] = useState<ReviewItem[]>(initialRatings);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [stars, setStars] = useState<number>(existingViewerReview?.stars || 5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingViewerReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          stars,
          comment: comment.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to submit review");
      }

      const newReview: ReviewItem = {
        id: json.data?.id || `local-${Date.now()}`,
        customerId: viewerUserId || "me",
        customerName: "You",
        stars,
        comment: comment.trim() || null,
        createdAt: json.data?.updated_at || new Date().toISOString(),
      };

      const nextList = [newReview, ...ratings.filter((r) => r.customerId !== newReview.customerId)];
      setRatings(nextList);
      const nextCount = nextList.length;
      const nextAvg = nextList.reduce((acc, r) => acc + r.stars, 0) / nextCount;
      setCount(nextCount);
      setAverage(Number(nextAvg.toFixed(2)));
      setSuccess("Your review has been saved. Thank you for helping the ASSAP community!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStarDisplay = hoverStars || stars;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-heading font-bold text-text-primary">
            Customer Reviews ({count})
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {average > 0 ? `Average rating: ${average.toFixed(2)} out of 5` : "No ratings yet"}
          </p>
        </div>
        {average > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-pale/25 border border-gold-brushed/40 text-brand text-xs font-bold tabular-nums">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            {average.toFixed(2)}
          </span>
        )}
      </div>

      {/* Review Submission Form (Customers) */}
      {canReview ? (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-2xl border border-border-subtle bg-surface-subtle/40 space-y-4"
        >
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-text-primary">
              {existingViewerReview ? "Update your rating & review" : "Rate your experience"}
            </p>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={stars === value}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHoverStars(value)}
                  onMouseLeave={() => setHoverStars(0)}
                  onClick={() => setStars(value)}
                  className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      value <= activeStarDisplay
                        ? "fill-gold text-gold"
                        : "text-text-muted/40"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-text-secondary tabular-nums">
                {activeStarDisplay} / 5
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-xs font-semibold text-text-secondary mb-1">
              Your Review
            </label>
            <textarea
              id="review-comment"
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how punctual, professional, and reliable this service provider was..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-status-danger-bg/50 border border-status-danger-border text-xs text-status-danger-text flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-status-success-bg/50 border border-status-success-border text-xs text-status-success-text flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Button type="submit" size="sm" isLoading={isSubmitting}>
            {existingViewerReview ? "Update Review" : "Submit Review"}
          </Button>
        </form>
      ) : viewerRole === "provider" ? (
        <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-muted">
          Signed in as a Service Provider. Switch to a Customer account to submit customer reviews.
        </div>
      ) : null}

      {/* Existing Reviews List */}
      {ratings.length === 0 ? (
        <p className="text-xs text-text-muted">No reviews recorded yet for this provider.</p>
      ) : (
        <div className="space-y-3">
          {ratings.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle/40 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">{r.customerName}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-text-primary font-semibold tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" /> {r.stars}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {r.comment && <p className="text-xs text-text-secondary leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
