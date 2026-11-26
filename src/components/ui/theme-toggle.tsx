"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else if (saved === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      } else {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    } catch {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {
        // ignore
      }
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {
        // ignore
      }
    }
    setIsDark(nextDark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-text-primary text-xs font-semibold transition-colors min-h-tap ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-gold" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-brand" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
