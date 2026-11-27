"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { UnifiedLocationBar } from "@/components/location/unified-location-bar";
import { ProviderCard } from "@/components/providers/provider-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_DIRECTORY_IMAGES,
  DIRECTORY_SHOWCASE_PROVIDERS,
  resolveProviderImage,
} from "@/lib/constants/directory-showcase";
import {
  EMPTY_LOCATION,
  type SelectedLocation,
} from "@/lib/constants/nigeria-locations";
import type { ProviderListItemDTO } from "@/types/domain";
import { Search, AlertCircle } from "lucide-react";

export default function ExplorePage() {
  const [providers, setProviders] = useState<ProviderListItemDTO[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<SelectedLocation>(EMPTY_LOCATION);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (location.state) params.set("state", location.state);
      if (location.city) params.set("city", location.city);
      if (location.lga) params.set("lga", location.lga);
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
  }, [location.state, location.city, location.lga, search]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const displayedProviders = useMemo(() => {
    const seenNames = new Set<string>();
    const usedImages = new Set<string>();

    const liveWithUniqueImages = providers.map((p) => {
      seenNames.add(p.businessName.trim().toLowerCase());
      if (p.imageUrl) {
        usedImages.add(p.imageUrl);
        return p;
      }
      const preferred = resolveProviderImage(p);
      let chosen = preferred;
      if (usedImages.has(chosen)) {
        const nextFree = ALL_DIRECTORY_IMAGES.find((img) => !usedImages.has(img));
        if (nextFree) chosen = nextFree;
      }
      usedImages.add(chosen);
      return { ...p, imageUrl: chosen };
    });

    const q = search.trim().toLowerCase();

    const matchingShowcase = DIRECTORY_SHOWCASE_PROVIDERS.filter((item) => {
      if (seenNames.has(item.businessName.trim().toLowerCase())) return false;
      if (item.imageUrl && usedImages.has(item.imageUrl)) return false;
      if (location.state && item.state !== location.state) return false;
      if (location.city && (item.city || "").toLowerCase() !== location.city.toLowerCase()) return false;
      if (location.lga && (item.lga || "").toLowerCase() !== location.lga.toLowerCase()) return false;
      if (q) {
        const haystack = [
          item.businessName,
          item.serviceTitle,
          item.serviceCategory,
          item.serviceDescription,
          item.officeAddress || "",
          item.locationArea,
          item.city || "",
          item.lga || "",
          ...item.serviceAreas,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (item.imageUrl) usedImages.add(item.imageUrl);
      return true;
    });

    return [...liveWithUniqueImages, ...matchingShowcase].slice(0, 15);
  }, [providers, location.state, location.city, location.lga, search]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Single-Line Unified Location + Search Services Row */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <UnifiedLocationBar value={location} onChange={setLocation} />

          <div className="relative flex-1">
            <Input
              placeholder="Search Services"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </form>

        {loadError && (
          <div className="p-4 rounded-xl bg-status-danger-bg/40 border border-status-danger-border text-xs text-status-danger-text flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Providers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-[380px] rounded-2xl bg-surface-subtle animate-pulse" />
            ))}
          </div>
        ) : displayedProviders.length === 0 ? (
          <div className="text-center py-16 border border-border-subtle rounded-2xl bg-surface p-6 space-y-3">
            <p className="text-sm font-semibold text-text-primary">No matching service providers found</p>
            {(search || location.state) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setLocation(EMPTY_LOCATION);
                }}
              >
                Show All Registered Providers
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
