import React from "react";
import { TopNav } from "./top-nav";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <TopNav />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-border-subtle py-6 text-center text-xs text-text-muted bg-surface/50">
        <p>© 2026 ASAP Nigeria. Verified local service providers across 36 states.</p>
      </footer>
    </div>
  );
}
