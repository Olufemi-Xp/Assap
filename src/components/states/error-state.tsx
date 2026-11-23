import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this section.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="text-center py-12 px-4 max-w-[420px] mx-auto space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-status-danger-bg text-status-danger-text flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-heading font-bold text-lg text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 mx-auto">
          <RotateCcw className="w-3.5 h-3.5" /> Try Again
        </Button>
      )}
    </div>
  );
}
