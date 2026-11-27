"use client";

import React, { useState } from "react";
import { Plus, X, CheckCircle2 } from "lucide-react";

export interface ServiceAreasEditorProps {
  value: string[];
  onChange: (areas: string[]) => void;
  category?: string;
}

export function ServiceAreasEditor({
  value,
  onChange,
}: ServiceAreasEditorProps) {
  const [draft, setDraft] = useState("");

  const addArea = (raw: string) => {
    const clean = raw.trim();
    if (!clean || clean.length < 2) return;
    if (value.some((existing) => existing.toLowerCase() === clean.toLowerCase())) {
      setDraft("");
      return;
    }
    if (value.length >= 25) return;
    onChange([...value, clean]);
    setDraft("");
  };

  const removeArea = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addArea(draft);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="service-area-input" className="block text-xs font-semibold text-text-primary mb-1">
          Service Details / Areas of Service <span className="text-red-500">*</span>
        </label>
        <p className="text-[11px] text-text-muted mb-2">
          Add the specific tasks and areas you handle (e.g., house wiring, socket repairs, lighting installation).
        </p>

        <div className="flex gap-2">
          <input
            id="service-area-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a service area (e.g. Socket repairs) and press Add"
            maxLength={100}
            className="flex-1 h-10 px-3.5 rounded-xl border border-border-subtle bg-surface text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
          <button
            type="button"
            onClick={() => addArea(draft)}
            disabled={draft.trim().length < 2}
            className="px-3.5 h-10 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Added Service Areas List */}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border-subtle bg-surface-subtle/40">
          {value.map((area, idx) => (
            <span
              key={`${area}-${idx}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border-subtle text-xs font-medium text-text-primary shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
              <span>{area}</span>
              <button
                type="button"
                onClick={() => removeArea(idx)}
                aria-label={`Remove ${area}`}
                className="ml-0.5 p-0.5 rounded text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-xl border border-dashed border-border-subtle text-[11px] text-text-muted text-center">
          No service areas added yet. Add at least one task or service area above.
        </div>
      )}
    </div>
  );
}
