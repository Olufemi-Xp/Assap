import React from "react";
import { AppSidebar } from "./app-sidebar";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex bg-canvas">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-8 pb-8">
          {children}
        </main>
        <footer className="border-t border-border-subtle py-5 text-center text-xs text-text-muted bg-surface/50">
          <p>&copy; 2026 ASAP Nigeria. Verified local service providers across 36 states.</p>
        </footer>
      </div>
    </div>
  );
}
