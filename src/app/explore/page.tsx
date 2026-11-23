"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProviderFilters } from "@/components/providers/provider-filters";
import { ProviderCard } from "@/components/providers/provider-card";
import { Input } from "@/components/ui/input";
import type { ProviderListItemDTO } from "@/types/domain";
import { Search } from "lucide-react";

export default function ExplorePage() {
  const [providers, setProviders] = useState<ProviderListItemDTO[]>([]);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchProviders() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedState) params.set("state", selectedState);
        if (selectedCategory) params.set("category", selectedCategory);
        if (search) params.set("search", search);

        const res = await fetch(`/api/providers?${params.toString()}`);
        const json = await res.json();
        if (!ignore && json.ok && json.data) {
          setProviders(json.data.items);
        }
      } catch (err) {
        console.error("Failed to load providers:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchProviders();
    return () => {
      ignore = true;
    };
  }, [selectedState, selectedCategory, search]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="max-w-[720px]">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
            Trade Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Browse verified local tradespeople across Nigeria. Ranked by ratings and proximity.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-[600px]">
          <Input
            placeholder="Search by trade or location (e.g. Yaba plumber)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
        </div>

        {/* Filters */}
        <ProviderFilters
          selectedState={selectedState}
          selectedCategory={selectedCategory}
          onStateChange={setSelectedState}
          onCategoryChange={setSelectedCategory}
        />

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 rounded-xl bg-surface-subtle animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-16 border border-border-subtle rounded-xl p-6">
            <p className="text-sm font-semibold text-text-primary">No service providers found</p>
            <p className="text-xs text-text-muted mt-1">
              Try adjusting your state filter or search terms.
            </p>
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
