"use client";

import React from "react";
import { NIGERIA_STATES } from "@/lib/constants/nigeria-states";
import { SERVICE_CATEGORIES } from "@/lib/constants/service-categories";

export interface ProviderFiltersProps {
  selectedState: string;
  selectedCategory: string;
  onStateChange: (state: string) => void;
  onCategoryChange: (category: string) => void;
}

export function ProviderFilters({
  selectedState,
  selectedCategory,
  onStateChange,
  onCategoryChange,
}: ProviderFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* 36-State Dropdown */}
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border-subtle bg-surface text-text-primary text-xs font-medium focus:ring-1 focus:ring-accent-primary min-h-tap sm:max-w-[240px]"
        >
          <option value="">All 36 States and FCT</option>
          {NIGERIA_STATES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Category Dropdown for Clean Mobile / Tablet Layout */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border-subtle bg-surface text-text-primary text-xs font-medium focus:ring-1 focus:ring-accent-primary min-h-tap sm:max-w-[240px]"
        >
          <option value="">All Trades & Services</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
