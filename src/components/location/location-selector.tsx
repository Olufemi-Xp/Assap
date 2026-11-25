"use client";

import React from "react";
import { MapPin, RotateCcw, Check } from "lucide-react";
import { NIGERIA_STATES } from "@/lib/constants/nigeria-states";
import {
  EMPTY_LOCATION,
  getCitiesForState,
  getLgasForCity,
  getLgasForState,
  type SelectedLocation,
} from "@/lib/constants/nigeria-locations";

export interface LocationSelectorProps {
  value: SelectedLocation;
  onChange: (next: SelectedLocation) => void;
  onSave?: () => void;
  isSaving?: boolean;
  savedFeedback?: boolean;
  showSaveButton?: boolean;
  compact?: boolean;
}

/**
 * Hierarchical Nigerian location selector: State -> City -> Local Government.
 * Once a State is chosen, both City and Local Government are active (and
 * selecting a City narrows Local Governments to that City).
 */
export function LocationSelector({
  value,
  onChange,
  onSave,
  isSaving = false,
  savedFeedback = false,
  showSaveButton = false,
  compact = false,
}: LocationSelectorProps) {
  const cities = getCitiesForState(value.state);
  const lgas = getLgasForState(value.state, value.city || undefined);

  const handleStateChange = (state: string) => {
    onChange({ state, city: "", lga: "" });
  };

  const handleCityChange = (city: string) => {
    const allowedLgas = city ? getLgasForCity(value.state, city) : getLgasForState(value.state);
    const keepLga = value.lga && allowedLgas.includes(value.lga) ? value.lga : "";
    onChange({ ...value, city, lga: keepLga });
  };

  const handleLgaChange = (lga: string) => {
    onChange({ ...value, lga });
  };

  const hasAnySelection = Boolean(value.state || value.city || value.lga);

  return (
    <div
      className={
        compact
          ? "space-y-3"
          : "p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface shadow-sm space-y-3"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-heading font-bold text-text-primary">
              Service Location Filter
            </h2>
            <p className="text-[11px] text-text-muted">
              Select State, City, and Local Government in order
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showSaveButton && value.state && onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors disabled:opacity-50"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Saved
                </>
              ) : isSaving ? (
                "Saving..."
              ) : (
                "Save Location"
              )}
            </button>
          )}
          {hasAnySelection && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_LOCATION)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. State */}
        <div>
          <label htmlFor="loc-state" className="block text-[11px] font-semibold text-text-secondary mb-1">
            1. State
          </label>
          <select
            id="loc-state"
            value={value.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary min-h-tap"
          >
            <option value="">All 36 States &amp; FCT</option>
            {NIGERIA_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. City */}
        <div>
          <label htmlFor="loc-city" className="block text-[11px] font-semibold text-text-secondary mb-1">
            2. City
          </label>
          <select
            id="loc-city"
            value={value.city}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!value.state}
            className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary min-h-tap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{value.state ? "All Cities in State" : "Select State first"}</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Local Government */}
        <div>
          <label htmlFor="loc-lga" className="block text-[11px] font-semibold text-text-secondary mb-1">
            3. Local Government
          </label>
          <select
            id="loc-lga"
            value={value.lga}
            onChange={(e) => handleLgaChange(e.target.value)}
            disabled={!value.state}
            className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary min-h-tap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{value.state ? "All Local Governments" : "Select State first"}</option>
            {lgas.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
