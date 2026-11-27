"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, MapPin, RotateCcw, Search, X } from "lucide-react";
import { NIGERIA_STATES } from "@/lib/constants/nigeria-states";
import {
  EMPTY_LOCATION,
  formatLocation,
  getCitiesForState,
  getLgasForCity,
  getLgasForState,
  type SelectedLocation,
} from "@/lib/constants/nigeria-locations";

export interface UnifiedLocationBarProps {
  value: SelectedLocation;
  onChange: (next: SelectedLocation) => void;
  onSave?: () => void;
  isSaving?: boolean;
  savedFeedback?: boolean;
  showSaveButton?: boolean;
}

type Step = "state" | "city" | "lga";

/**
 * Single unified "Location" selector bar for the Trade Directory.
 * Clicking the Location bar opens a cascading popout:
 *   1. All 36 Nigerian States (+ FCT)
 *   2. Cities under the selected State (opens automatically after State pick)
 *   3. Local Governments under the selected City/State (opens automatically after City pick)
 */
export function UnifiedLocationBar({
  value,
  onChange,
  onSave,
  isSaving = false,
  savedFeedback = false,
  showSaveButton = false,
}: UnifiedLocationBarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("state");
  const [filterText, setFilterText] = useState("");

  // Close popout on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const cities = useMemo(() => getCitiesForState(value.state), [value.state]);
  const lgas = useMemo(
    () => (value.city ? getLgasForCity(value.state, value.city) : getLgasForState(value.state)),
    [value.state, value.city]
  );

  const query = filterText.trim().toLowerCase();

  const filteredStates = useMemo(
    () =>
      query
        ? NIGERIA_STATES.filter((s) => s.label.toLowerCase().includes(query))
        : NIGERIA_STATES,
    [query]
  );

  const filteredCities = useMemo(
    () => (query ? cities.filter((c) => c.name.toLowerCase().includes(query)) : cities),
    [cities, query]
  );

  const filteredLgas = useMemo(
    () => (query ? lgas.filter((l) => l.toLowerCase().includes(query)) : lgas),
    [lgas, query]
  );

  const openPopout = () => {
    setFilterText("");
    if (!value.state) {
      setStep("state");
    } else if (!value.city) {
      setStep("city");
    } else if (!value.lga) {
      setStep("lga");
    } else {
      setStep("state");
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelectState = (stateVal: string) => {
    onChange({ state: stateVal, city: "", lga: "" });
    setFilterText("");
    setStep("city");
    setIsOpen(true);
  };

  const handleSelectCity = (cityName: string) => {
    onChange({ state: value.state, city: cityName, lga: "" });
    setFilterText("");
    if (cityName) {
      setStep("lga");
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectLga = (lgaName: string) => {
    onChange({ ...value, lga: lgaName });
    setFilterText("");
    setIsOpen(false);
  };

  const handleReset = () => {
    onChange(EMPTY_LOCATION);
    setFilterText("");
    setStep("state");
  };

  const selectedStateLabel =
    NIGERIA_STATES.find((s) => s.value === value.state)?.label || "";
  const activeSummary = formatLocation(value);

  return (
    <div ref={containerRef} className="relative z-30">
      <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <span className="block text-xs sm:text-sm font-heading font-bold text-text-primary">
                Location
              </span>
              <p className="text-[11px] text-text-muted">
                Click Location to choose State, City, and Local Government
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
            {activeSummary && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Single Unified Location Bar */}
        <button
          type="button"
          onClick={openPopout}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="w-full min-h-12 px-4 py-2.5 rounded-xl border border-border-subtle bg-canvas/70 hover:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-colors flex items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <MapPin className="w-4 h-4 text-accent-primary flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex-shrink-0">
              Location:
            </span>
            <span
              className={`text-xs sm:text-sm font-semibold truncate ${
                activeSummary ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              {activeSummary || "All 36 States & FCT — Click to select State, City & LGA"}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-accent-primary" : ""
            }`}
          />
        </button>
      </div>

      {/* Cascading Popout Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Select Location"
          className="absolute left-0 right-0 mt-2 rounded-2xl border border-border-subtle bg-surface shadow-2xl overflow-hidden z-40"
        >
          {/* Step Breadcrumb Header */}
          <div className="px-4 py-3 border-b border-border-subtle bg-surface-subtle/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFilterText("");
                  setStep("state");
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  step === "state"
                    ? "bg-accent-primary text-white"
                    : "bg-surface text-text-primary hover:bg-surface-subtle"
                }`}
              >
                {selectedStateLabel || "1. Select State"}
              </button>

              {value.state && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  <button
                    type="button"
                    onClick={() => {
                      setFilterText("");
                      setStep("city");
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      step === "city"
                        ? "bg-accent-primary text-white"
                        : "bg-surface text-text-primary hover:bg-surface-subtle"
                    }`}
                  >
                    {value.city || "2. Select City"}
                  </button>
                </>
              )}

              {value.state && value.city && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  <button
                    type="button"
                    onClick={() => {
                      setFilterText("");
                      setStep("lga");
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      step === "lga"
                        ? "bg-accent-primary text-white"
                        : "bg-surface text-text-primary hover:bg-surface-subtle"
                    }`}
                  >
                    {value.lga || "3. Select LGA"}
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close location selector"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Input */}
          <div className="p-3 border-b border-border-subtle">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={
                  step === "state"
                    ? "Search 36 states & Abuja FCT..."
                    : step === "city"
                    ? `Search cities in ${selectedStateLabel}...`
                    : `Search local governments in ${value.city || selectedStateLabel}...`
                }
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border-subtle bg-canvas/60 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          {/* Options Grid */}
          <div className="max-h-[300px] overflow-y-auto p-3">
            {step === "state" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredStates.map((s) => {
                  const active = value.state === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => handleSelectState(s.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors border ${
                        active
                          ? "bg-accent-primary text-white border-accent-primary"
                          : "bg-canvas/50 text-text-primary border-border-subtle hover:border-accent-primary hover:bg-accent-primary/10"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
                {filteredStates.length === 0 && (
                  <p className="col-span-full text-xs text-text-muted py-4 text-center">
                    No matching states found.
                  </p>
                )}
              </div>
            )}

            {step === "city" && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectCity("")}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-left border border-dashed border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10 transition-colors"
                >
                  All Cities in {selectedStateLabel}
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredCities.map((c) => {
                    const active = value.city === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectCity(c.name)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors border flex items-center justify-between ${
                          active
                            ? "bg-accent-primary text-white border-accent-primary"
                            : "bg-canvas/50 text-text-primary border-border-subtle hover:border-accent-primary hover:bg-accent-primary/10"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] opacity-75">{c.lgas.length} LGAs</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === "lga" && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelectLga("")}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-left border border-dashed border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10 transition-colors"
                >
                  All Local Governments in {value.city || selectedStateLabel}
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredLgas.map((lga) => {
                    const active = value.lga === lga;
                    return (
                      <button
                        key={lga}
                        type="button"
                        onClick={() => handleSelectLga(lga)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors border ${
                          active
                            ? "bg-accent-primary text-white border-accent-primary"
                            : "bg-canvas/50 text-text-primary border-border-subtle hover:border-accent-primary hover:bg-accent-primary/10"
                        }`}
                      >
                        {lga}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
