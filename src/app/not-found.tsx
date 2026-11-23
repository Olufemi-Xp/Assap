import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <AppShell>
      <div className="py-24 text-center max-w-[420px] mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-surface-subtle text-text-muted flex items-center justify-center mx-auto">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Page Not Found
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed">
          The requested page or listing could not be found.
        </p>
        <Link href="/explore">
          <Button className="mt-2">Back to Explore</Button>
        </Link>
      </div>
    </AppShell>
  );
}
