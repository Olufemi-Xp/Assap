"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LocationSelector } from "@/components/location/location-selector";
import { ProviderCard } from "@/components/providers/provider-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_CATEGORIES } from "@/lib/constants/service-categories";
import {
  EMPTY_LOCATION,
  formatLocation,
  normalizeLocation,
  type SelectedLocation,
} from "@/lib/constants/nigeria-locations";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import type { ProviderListItemDTO } from "@/types/domain";
import { Search, SlidersHorizontal, Users, AlertCircle, Play } from "lucide-react";

export default function ExplorePage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<ProviderListItemDTO[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<SelectedLocation>(EMPTY_LOCATION);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSavingLoc, setIsSavingLoc] = useState(false);
  const [savedLocFeedback, setSavedLocFeedback] = useState(false);

  // Load saved customer location once user is available
  useEffect(() => {
    if (!user) return;
    let ignore = false;
    async function loadSavedLocation() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("users")
          .select("state, city, lga")
          .eq("id", user!.id)
          .maybeSingle();

        if (!ignore && data?.state) {
          const norm = normalizeLocation({
            state: data.state,
            city: data.city ?? "",
            lga: data.lga ?? "",
          });
          if (norm) setLocation(norm);
        }
      } catch {
        // Ignore if columns aren't migrated yet
      }
    }
    loadSavedLocation();
    return () => {
      ignore = true;
    };
  }, [user]);

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (location.state) params.set("state", location.state);
      if (location.city) params.set("city", location.city);
      if (location.lga) params.set("lga", location.lga);
      if (selectedCategory) params.set("category", selectedCategory);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/providers?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Could not load registered service providers.");
      }
      setProviders(json.data?.items || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setIsLoading(false);
    }
  }, [location.state, location.city, location.lga, selectedCategory, search]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleSearchFocus = () => {
    // Ensure live registered providers are surfaced immediately when clicking the search bar
    if (providers.length === 0 && !isLoading) {
      fetchProviders();
    }
  };

  const handleSaveLocation = async () => {
    setIsSavingLoc(true);
    setSavedLocFeedback(false);
    try {
      const res = await fetch("/api/profile/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      });
      if (res.ok) {
        setSavedLocFeedback(true);
        setTimeout(() => setSavedLocFeedback(false), 2500);
      }
    } finally {
      setIsSavingLoc(false);
    }
  };

  const activeLocationLabel = formatLocation(location);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="max-w-[720px]">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
              Trade Directory
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Live directory of registered service providers on ASSAP. Filter by State, Local Government, City, or
              search by service title and tasks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border-subtle text-text-secondary text-xs font-semibold tabular-nums">
              <Users className="w-3.5 h-3.5 text-accent-primary" />
              <span>{providers.length} registered provider{providers.length === 1 ? "" : "s"}</span>
            </span>
            {activeLocationLabel && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-semibold">
                {activeLocationLabel}
              </span>
            )}
          </div>
        </div>

        {/* Hierarchical Location Module: State, Local Government & City */}
        <LocationSelector
          value={location}
          onChange={setLocation}
          onSave={handleSaveLocation}
          isSaving={isSavingLoc}
          savedFeedback={savedLocFeedback}
          showSaveButton={Boolean(user)}
        />

        {/* Services Search & Category Filter */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Click or type to search registered services (e.g. Fashion Designer, Electrician, socket repairs)..."
              value={search}
              onFocus={handleSearchFocus}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          <div className="relative sm:w-[220px]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted absolute left-3.5 top-3.5 pointer-events-none" />
            <select
              aria-label="Filter by service category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-border-subtle bg-surface text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary min-h-tap"
            >
              <option value="">All Trades &amp; Services</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" isLoading={isLoading} className="gap-1.5 h-11 px-5 flex-shrink-0">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
          </Button>
        </form>

        {loadError && (
          <div className="p-4 rounded-xl bg-status-danger-bg/40 border border-status-danger-border text-xs text-status-danger-text flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Live Registered Providers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 rounded-2xl bg-surface-subtle animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-16 border border-border-subtle rounded-2xl bg-surface p-6 space-y-3">
            <p className="text-sm font-semibold text-text-primary">No matching service providers found</p>
            <p className="text-xs text-text-muted">
              Try clearing your search query or broadening your State / Local Government / City filter.
            </p>
            {(search || location.state || selectedCategory) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setLocation(EMPTY_LOCATION);
                  setSelectedCategory("");
                }}
              >
                Show All Registered Providers
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
