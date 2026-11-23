import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SelfieIdCapture } from "@/components/onboarding/selfie-id-capture";

export default function KycCapturePage() {
  return (
    <AppShell>
      <div className="py-8">
        <Suspense fallback={<div className="text-center py-12 text-sm text-text-muted">Loading onboarding...</div>}>
          <SelfieIdCapture />
        </Suspense>
      </div>
    </AppShell>
  );
}
