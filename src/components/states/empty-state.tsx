import React from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No results found",
  message = "Try clearing or broadening your search filters.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 border border-dashed border-border-subtle rounded-2xl max-w-[460px] mx-auto space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-text-muted flex items-center justify-center mx-auto">
        <SearchX className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-heading font-bold text-base text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{message}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mx-auto">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
