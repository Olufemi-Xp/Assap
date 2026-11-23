"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="py-20 text-center max-w-[460px] mx-auto space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-status-danger-bg text-status-danger-text flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Something unexpected happened
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed">
          We encountered an error loading this view. You can retry safely.
        </p>
        <Button onClick={() => reset()} className="w-full">
          Reload Page
        </Button>
      </div>
    </AppShell>
  );
}
