"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortfolioCommentDTO, PortfolioItemDTO } from "@/types/domain";
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Calendar,
  Clock,
  Check,
  Send,
  Briefcase,
} from "lucide-react";

export interface PortfolioGalleryProps {
  providerId: string;
  providerName: string;
  initialItems: PortfolioItemDTO[];
  isSignedIn: boolean;
}

export function PortfolioGallery({
  providerId,
  providerName,
  initialItems,
  isSignedIn,
}: PortfolioGalleryProps) {
  const [items, setItems] = useState<PortfolioItemDTO[]>(initialItems);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentsByItem, setCommentsByItem] = useState<Record<string, PortfolioCommentDTO[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [draftComment, setDraftComment] = useState<Record<string, string>>({});
  const [postingComment, setPostingComment] = useState<Record<string, boolean>>({});
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggleLike = async (itemId: string) => {
    if (!isSignedIn) {
      setFeedback("Sign in to like portfolio work.");
      return;
    }
    setFeedback(null);

    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              likedByViewer: !item.likedByViewer,
              likeCount: item.likedByViewer ? Math.max(0, item.likeCount - 1) : item.likeCount + 1,
            }
          : item
      )
    );

    try {
      const res = await fetch(`/api/portfolio/${itemId}/like`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Could not update like");
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, likedByViewer: json.data.liked, likeCount: json.data.likeCount }
            : item
        )
      );
    } catch (err) {
      // Revert optimistic toggle on error
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                likedByViewer: !item.likedByViewer,
                likeCount: item.likedByViewer ? Math.max(0, item.likeCount - 1) : item.likeCount + 1,
              }
            : item
        )
      );
      setFeedback((err as Error).message);
    }
  };

  const handleToggleComments = async (itemId: string) => {
    const nextOpen = !openComments[itemId];
    setOpenComments((prev) => ({ ...prev, [itemId]: nextOpen }));
    if (nextOpen && !commentsByItem[itemId]) {
      setLoadingComments((prev) => ({ ...prev, [itemId]: true }));
      try {
        const res = await fetch(`/api/portfolio/${itemId}/comments`);
        const json = await res.json();
        if (res.ok && json.ok) {
          setCommentsByItem((prev) => ({ ...prev, [itemId]: json.data.comments || [] }));
        }
      } finally {
        setLoadingComments((prev) => ({ ...prev, [itemId]: false }));
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    const body = (draftComment[itemId] || "").trim();
    if (!body) return;
    if (!isSignedIn) {
      setFeedback("Sign in to comment on portfolio work.");
      return;
    }

    setPostingComment((prev) => ({ ...prev, [itemId]: true }));
    setFeedback(null);
    try {
      const res = await fetch(`/api/portfolio/${itemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to post comment");
      }
      setCommentsByItem((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), json.data.comment],
      }));
      setDraftComment((prev) => ({ ...prev, [itemId]: "" }));
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, commentCount: item.commentCount + 1 } : item))
      );
    } catch (err) {
      setFeedback((err as Error).message);
    } finally {
      setPostingComment((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleShare = async (item: PortfolioItemDTO) => {
    const shareUrl = `${window.location.origin}/providers/${providerId}#portfolio-${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${item.title} — ${providerName}`,
          text: item.deliveryStory.slice(0, 140),
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedItemId(item.id);
      setTimeout(() => setCopiedItemId((curr) => (curr === item.id ? null : curr)), 2500);

      const res = await fetch(`/api/portfolio/${item.id}/share`, { method: "POST" });
      const json = await res.json();
      if (res.ok && json.ok) {
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, shareCount: json.data.shareCount } : p))
        );
      }
    } catch {
      // User cancelled native share sheet; ignore
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-heading font-bold text-text-primary flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-accent-primary" />
            <span>Delivered Job History &amp; Portfolio ({items.length})</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real before-and-after work completed by {providerName}.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-status-warning-bg/50 border border-status-warning-border text-xs text-status-warning-text">
          {feedback}
        </div>
      )}

      {items.filter((item) => item.isVisible !== false).length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-border-subtle bg-surface-subtle/40 text-center text-xs text-text-muted">
          This service provider has not published any visible portfolio jobs yet.
        </div>
      ) : (
        <div className="space-y-6">
          {items
            .filter((item) => item.isVisible !== false)
            .map((item) => {
              const commentsOpen = Boolean(openComments[item.id]);
              const itemComments = commentsByItem[item.id] || [];
              const singleImageUrl = item.afterImageUrl || item.beforeImageUrl;

            return (
              <article
                key={item.id}
                id={`portfolio-${item.id}`}
                className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface-subtle/30 space-y-4"
              >
                {/* Header & Supporting Metadata */}
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-base text-text-primary">{item.title}</h3>

                  {(item.jobLocation || item.completedOn || item.duration) && (
                    <div className="flex flex-wrap gap-2 text-[11px] text-text-muted">
                      {item.jobLocation && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-subtle">
                          <MapPin className="w-3 h-3 text-accent-primary" /> {item.jobLocation}
                        </span>
                      )}
                      {item.completedOn && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-subtle">
                          <Calendar className="w-3 h-3 text-accent-primary" /> {item.completedOn}
                        </span>
                      )}
                      {item.duration && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-subtle">
                          <Clock className="w-3 h-3 text-accent-primary" /> {item.duration}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Single Job Image Window */}
                {singleImageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-border-subtle bg-surface aspect-[16/10]">
                    <img
                      src={singleImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Delivery Story & Extra Details */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {item.deliveryStory}
                  </p>
                  {item.extraDetails && (
                    <p className="text-xs text-text-muted bg-surface p-3 rounded-xl border border-border-subtle">
                      <strong className="text-text-secondary">Materials &amp; Notes:</strong> {item.extraDetails}
                    </p>
                  )}
                </div>

                {/* Interactive Engagement Bar: Like, Comment, Share */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      item.likedByViewer
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                        : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${item.likedByViewer ? "fill-current" : ""}`} />
                    <span>Like</span>
                    <span className="tabular-nums opacity-80">({item.likeCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleComments(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      commentsOpen
                        ? "bg-accent-primary/10 text-accent-primary border-accent-primary/30"
                        : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Comment</span>
                    <span className="tabular-nums opacity-80">({item.commentCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
                  >
                    {copiedItemId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-accent-primary" />
                        <span className="text-accent-primary">Link copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                        <span className="tabular-nums opacity-80">({item.shareCount})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Expandable Comments Thread */}
                {commentsOpen && (
                  <div className="pt-3 border-t border-border-subtle space-y-3">
                    {loadingComments[item.id] ? (
                      <p className="text-xs text-text-muted">Loading comments...</p>
                    ) : itemComments.length === 0 ? (
                      <p className="text-xs text-text-muted">No comments yet. Be the first to ask or compliment!</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {itemComments.map((c) => (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-surface border border-border-subtle text-xs space-y-0.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-text-primary">{c.authorName}</span>
                              <span className="text-[10px] text-text-muted">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-text-secondary">{c.body}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={(e) => handleAddComment(e, item.id)} className="flex items-center gap-2">
                      <Input
                        placeholder={isSignedIn ? "Write a comment on this job..." : "Sign in to leave a comment"}
                        value={draftComment[item.id] || ""}
                        onChange={(e) =>
                          setDraftComment((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        disabled={!isSignedIn || Boolean(postingComment[item.id])}
                        className="h-9 text-xs"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!isSignedIn || !(draftComment[item.id] || "").trim()}
                        isLoading={Boolean(postingComment[item.id])}
                        className="gap-1 flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </Button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
