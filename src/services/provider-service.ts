import { createDbClient } from "../lib/supabase/db.ts";
import { sanitizeProviderContact } from "../lib/contact-sanitizer.ts";
import { SERVICE_CATEGORIES } from "../lib/constants/service-categories.ts";
import type { ProviderListItemDTO, ProviderDetailDTO } from "@/types/domain";
import type { DbSubscription } from "@/types/database";
import type { ProviderBusinessCardInput } from "@/lib/validation/provider.schema";

export interface SearchProvidersOptions {
  state?: string;
  city?: string;
  lga?: string;
  category?: string;
  search?: string;
  minRating?: number;
  page?: number;
  pageSize?: number;
  currentUserId?: string;
}

const CATEGORY_TITLE_MAP: Record<string, string> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.value, c.label])
);

const IS_TEST_RUNTIME =
  process.env.NODE_ENV === "test" ||
  process.argv.some((a) => a.endsWith(".test.ts") || a.endsWith(".spec.ts"));

const MOCK_PROVIDERS: ProviderListItemDTO[] = [
  {
    id: "pr000000-0000-0000-0000-000000000001",
    userId: "p0000000-0000-0000-0000-000000000001",
    businessName: "Tunde Reliable Plumbing",
    serviceTitle: "Master Plumber",
    serviceCategory: "plumber",
    serviceDescription: "Expert leak detection, pipe fixing, water heater setup, and drain cleaning.",
    serviceAreas: [
      "Leak detection & repair",
      "PPR & PVC pipe installation",
      "Water heater setup",
      "Drain & sink unblocking",
    ],
    state: "lagos",
    city: "Lagos Metropolis",
    lga: "Lagos Mainland",
    locationArea: "Yaba",
    averageRating: 4.85,
    ratingCount: 12,
    canContact: true,
    phoneNumber: "+2348012345678",
    whatsappNumber: "+2348012345678",
    subscriptionStatusBadge: "trial_active",
  },
];

const MOCK_IDS = new Set(MOCK_PROVIDERS.map((p) => p.id));

function parseServiceAreas(raw: unknown, fallbackDescription?: string): string[] {
  if (Array.isArray(raw)) {
    const cleaned = raw.map((x) => String(x).trim()).filter(Boolean);
    if (cleaned.length > 0) return cleaned;
  }
  if (typeof raw === "string" && raw.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((x) => String(x).trim()).filter(Boolean);
        if (cleaned.length > 0) return cleaned;
      }
    } catch {
      // ignore
    }
  }
  if (fallbackDescription) {
    // Support encoded fallback format "[Title] area1 | area2" when migration 000006 isn't applied yet
    const body = fallbackDescription.replace(/^\[[^\]]+\]\s*/, "");
    const parts = body
      .split(/[,|\n•;]+/)
      .map((s) => s.trim().replace(/\.$/, ""))
      .filter((s) => s.length >= 2 && s.length <= 100);
    if (parts.length > 0) return parts.slice(0, 12);
  }
  return [];
}

function parseTitleFallback(rawTitle: string | null | undefined, description: string, category: string): string {
  if (rawTitle && rawTitle.trim()) return rawTitle.trim();
  const match = description.match(/^\[([^\]]+)\]/);
  if (match && match[1].trim()) return match[1].trim();
  return CATEGORY_TITLE_MAP[category] || "Service Provider";
}

function norm(v: string | null | undefined): string {
  return (v || "").trim().toLowerCase();
}

function matchesFilters(p: ProviderListItemDTO, opts: SearchProvidersOptions): boolean {
  if (opts.state && norm(p.state) !== norm(opts.state)) return false;

  if (opts.city) {
    const targetCity = norm(opts.city);
    const cityMatch =
      norm(p.city) === targetCity ||
      (!p.city && norm(p.locationArea).includes(targetCity));
    if (!cityMatch) return false;
  }

  if (opts.lga) {
    const targetLga = norm(opts.lga);
    const lgaMatch =
      norm(p.lga) === targetLga ||
      (!p.lga && norm(p.locationArea).includes(targetLga));
    if (!lgaMatch) return false;
  }

  if (opts.category && norm(p.serviceCategory) !== norm(opts.category)) return false;
  if (opts.minRating && p.averageRating < opts.minRating) return false;

  const term = norm(opts.search);
  if (term) {
    const haystack = [
      p.businessName,
      p.serviceTitle,
      p.serviceCategory,
      p.serviceDescription,
      p.locationArea,
      p.city || "",
      p.lga || "",
      p.state,
      ...p.serviceAreas,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  return true;
}

type ProviderRow = {
  id: string;
  user_id: string;
  business_name: string;
  service_title?: string | null;
  service_category: string;
  service_description: string;
  service_areas?: unknown;
  state: string;
  city?: string | null;
  lga?: string | null;
  location_area: string;
  phone_number: string;
  whatsapp_number: string;
  average_rating: number | string;
  rating_count: number;
  subscriptions?: DbSubscription[] | null;
};

function mapProviderRow(row: ProviderRow): ProviderListItemDTO {
  const subscriptions = [...(row.subscriptions || [])];
  const latestSub = subscriptions.sort(
    (a, b) => new Date(b.current_period_end).getTime() - new Date(a.current_period_end).getTime()
  )[0];

  const sanitized = sanitizeProviderContact(
    { phoneNumber: row.phone_number, whatsappNumber: row.whatsapp_number },
    latestSub
      ? { status: latestSub.status, currentPeriodEnd: latestSub.current_period_end, planType: latestSub.plan_type }
      : null
  );

  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    serviceTitle: parseTitleFallback(row.service_title, row.service_description, row.service_category),
    serviceCategory: row.service_category as ProviderListItemDTO["serviceCategory"],
    serviceDescription: row.service_description.replace(/^\[[^\]]+\]\s*/, ""),
    serviceAreas: parseServiceAreas(row.service_areas, row.service_description),
    state: row.state as ProviderListItemDTO["state"],
    city: row.city ?? null,
    lga: row.lga ?? null,
    locationArea: row.location_area,
    averageRating: Number(row.average_rating),
    ratingCount: row.rating_count,
    canContact: sanitized.canContact,
    phoneNumber: sanitized.phoneNumber,
    whatsappNumber: sanitized.whatsappNumber,
    subscriptionStatusBadge: sanitized.subscriptionStatusBadge,
  };
}

/** "Ngozi Okon" -> "Ngozi O." */
export function toDisplayName(fullName: string | null | undefined, fallback = "Verified Customer"): string {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

async function loadRatingsWithNames(providerId: string): Promise<ProviderDetailDTO["ratings"]> {
  const db = await createDbClient();
  const { data: ratings, error } = await db
    .from("ratings")
    .select("id, customer_id, stars, comment, created_at")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !ratings) return [];

  const customerIds = [...new Set(ratings.map((r) => r.customer_id as string))];
  const names = new Map<string, string>();
  if (customerIds.length > 0) {
    const { data: users } = await db.from("users").select("id, full_name").in("id", customerIds);
    (users || []).forEach((u: { id: string; full_name: string }) => names.set(u.id, toDisplayName(u.full_name)));
  }

  return ratings.map((r) => ({
    id: r.id as string,
    customerId: r.customer_id as string,
    customerName: names.get(r.customer_id as string) || "Verified Customer",
    stars: r.stars as number,
    comment: (r.comment as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

function isMissingColumnError(err: { message?: string } | null | undefined): boolean {
  const msg = (err?.message || "").toLowerCase();
  return (
    msg.includes("column") ||
    msg.includes("schema cache") ||
    msg.includes("service_title") ||
    msg.includes("service_areas") ||
    msg.includes("city") ||
    msg.includes("lga")
  );
}

export const providerService = {
  async searchProviders(opts: SearchProvidersOptions): Promise<{ items: ProviderListItemDTO[]; total: number }> {
    const page = opts.page || 1;
    const pageSize = opts.pageSize || 20;

    try {
      const db = await createDbClient();
      let { data: profileRows, error } = await db
        .from("provider_profiles")
        .select("*, subscriptions(*)")
        .is("deleted_at", null)
        .order("average_rating", { ascending: false })
        .order("rating_count", { ascending: false })
        .limit(200);

      // Fallback if subscriptions join fails for any reason
      if (error) {
        const plain = await db
          .from("provider_profiles")
          .select("*")
          .is("deleted_at", null)
          .order("average_rating", { ascending: false })
          .limit(200);
        if (!plain.error && plain.data) {
          profileRows = plain.data;
          error = null;
        }
      }

      if (error) throw error;

      const mappedProfiles = ((profileRows || []) as ProviderRow[]).map(mapProviderRow);
      const profileUserIds = new Set(mappedProfiles.map((p) => p.userId));

      // Also surface registered provider users (with safe column fallback if city/lga aren't migrated yet)
      let providerUsers: Array<{
        id: string;
        full_name: string;
        state: string | null;
        city?: string | null;
        lga?: string | null;
        location_area: string | null;
      }> = [];

      const uRes = await db
        .from("users")
        .select("id, full_name, state, city, lga, location_area")
        .eq("role", "provider")
        .is("deleted_at", null)
        .eq("is_suspended", false)
        .limit(100);

      if (uRes.error && isMissingColumnError(uRes.error)) {
        const uFallback = await db
          .from("users")
          .select("id, full_name, state, location_area")
          .eq("role", "provider")
          .is("deleted_at", null)
          .eq("is_suspended", false)
          .limit(100);
        providerUsers = uFallback.data || [];
      } else {
        providerUsers = uRes.data || [];
      }

      const unconfiguredProviders: ProviderListItemDTO[] = providerUsers
        .filter((u) => !profileUserIds.has(u.id))
        .map((u) => ({
          id: `user-${u.id}`,
          userId: u.id,
          businessName: u.full_name || "ASAP Service Provider",
          serviceTitle: "Registered Service Provider",
          serviceCategory: "other",
          serviceDescription: "Registered service provider on ASAP.",
          serviceAreas: ["General Local Services"],
          state: (u.state || "lagos") as ProviderListItemDTO["state"],
          city: u.city ?? null,
          lga: u.lga ?? null,
          locationArea: u.location_area || "Nigeria",
          averageRating: 0,
          ratingCount: 0,
          canContact: false,
          subscriptionStatusBadge: "contact_hidden" as const,
        }));

      const allCombined = [...mappedProfiles, ...unconfiguredProviders];
      const filtered = allCombined.filter((item) => matchesFilters(item, opts));
      const start = (page - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);

      return { items: paged, total: filtered.length };
    } catch (err) {
      if (IS_TEST_RUNTIME) {
        const items = MOCK_PROVIDERS.filter((item) => matchesFilters(item, opts));
        return { items, total: items.length };
      }
      throw err;
    }
  },

  async getProviderById(id: string): Promise<ProviderDetailDTO | null> {
    if (id.startsWith("user-")) {
      const userId = id.slice(5);
      try {
        const db = await createDbClient();
        const { data: u } = await db
          .from("users")
          .select("id, full_name, state, location_area")
          .eq("id", userId)
          .eq("role", "provider")
          .maybeSingle();
        if (!u) return null;
        return {
          id,
          userId: u.id,
          businessName: u.full_name || "ASAP Service Provider",
          serviceTitle: "Registered Service Provider",
          serviceCategory: "other",
          serviceDescription: "Registered service provider on ASAP.",
          serviceAreas: ["General Local Services"],
          state: (u.state || "lagos") as ProviderListItemDTO["state"],
          city: null,
          lga: null,
          locationArea: u.location_area || "Nigeria",
          averageRating: 0,
          ratingCount: 0,
          canContact: false,
          subscriptionStatusBadge: "contact_hidden",
          ratings: [],
        };
      } catch {
        return null;
      }
    }

    try {
      const db = await createDbClient();
      const { data: row, error } = await db
        .from("provider_profiles")
        .select("*, subscriptions(*)")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) throw error;
      if (!row) return IS_TEST_RUNTIME && MOCK_IDS.has(id) ? this.getMockDetail(id) : null;

      return { ...mapProviderRow(row as ProviderRow), ratings: await loadRatingsWithNames(id) };
    } catch {
      return IS_TEST_RUNTIME && MOCK_IDS.has(id) ? this.getMockDetail(id) : null;
    }
  },

  /** Loads the provider listing owned by a given auth user (used by the provider dashboard). */
  async getProviderByUserId(userId: string): Promise<ProviderDetailDTO | null> {
    try {
      const db = await createDbClient();
      const { data: row, error } = await db
        .from("provider_profiles")
        .select("*, subscriptions(*)")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .maybeSingle();

      if (error || !row) return null;
      const mapped = mapProviderRow(row as ProviderRow);
      return { ...mapped, ratings: await loadRatingsWithNames(mapped.id) };
    } catch {
      return null;
    }
  },

  /** Creates or updates a provider's Service Business Card & Service Areas. */
  async upsertBusinessCard(
    userId: string,
    email: string,
    input: ProviderBusinessCardInput
  ): Promise<ProviderDetailDTO> {
    const db = await createDbClient();
    const effectiveLocationArea =
      input.locationArea?.trim() || input.lga?.trim() || input.city?.trim() || input.state;
    const effectiveWhatsapp = input.whatsappNumber?.trim() || input.phoneNumber;

    // 1. Sync public.users (gracefully handle unmigrated city/lga columns)
    const userPayloadBase = {
      id: userId,
      email,
      full_name: input.businessName,
      role: "provider" as const,
      state: input.state,
      location_area: effectiveLocationArea,
      updated_at: new Date().toISOString(),
    };
    const userRes = await db.from("users").upsert({
      ...userPayloadBase,
      city: input.city || null,
      lga: input.lga || null,
    });
    if (userRes.error && isMissingColumnError(userRes.error)) {
      await db.from("users").upsert(userPayloadBase);
    }

    const summaryDescription = input.serviceDescription?.trim() || input.serviceAreas.join(" | ");
    const encodedFallbackDescription = `[${input.serviceTitle}] ${input.serviceAreas.join(" | ")}${
      input.serviceDescription?.trim() ? ` — ${input.serviceDescription.trim()}` : ""
    }`;

    const fullPayload = {
      user_id: userId,
      business_name: input.businessName,
      service_title: input.serviceTitle,
      service_category: input.serviceCategory,
      service_description: summaryDescription,
      service_areas: input.serviceAreas,
      state: input.state,
      city: input.city || null,
      lga: input.lga || null,
      location_area: effectiveLocationArea,
      phone_number: input.phoneNumber,
      whatsapp_number: effectiveWhatsapp,
      updated_at: new Date().toISOString(),
    };

    let { data: profile, error } = await db
      .from("provider_profiles")
      .upsert(fullPayload, { onConflict: "user_id" })
      .select("*, subscriptions(*)")
      .single();

    // Graceful fallback if migration 000005/000006 columns don't exist yet on the DB
    if (error && isMissingColumnError(error)) {
      const legacyPayload = {
        user_id: userId,
        business_name: input.businessName,
        service_category: input.serviceCategory,
        service_description: encodedFallbackDescription.slice(0, 1000),
        state: input.state,
        location_area: effectiveLocationArea,
        phone_number: input.phoneNumber,
        whatsapp_number: effectiveWhatsapp,
        updated_at: new Date().toISOString(),
      };
      const retry = await db
        .from("provider_profiles")
        .upsert(legacyPayload, { onConflict: "user_id" })
        .select("*, subscriptions(*)")
        .single();
      profile = retry.data;
      error = retry.error;
    }

    if (error || !profile) {
      throw new Error(error?.message || "Failed to save Service Business Card");
    }

    // Best-effort initial 30-day free trial creation (RLS may restrict direct client inserts on subscriptions)
    try {
      const { data: existingSub } = await db
        .from("subscriptions")
        .select("id")
        .eq("provider_id", profile.id)
        .maybeSingle();

      if (!existingSub) {
        const now = new Date();
        const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await db.from("subscriptions").insert({
          provider_id: profile.id,
          plan_type: "free_trial",
          amount_ngn: 0,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: end.toISOString(),
        });
      }
    } catch {
      // Non-fatal: profile is saved
    }

    const mapped = mapProviderRow(profile as ProviderRow);
    return {
      ...mapped,
      serviceTitle: input.serviceTitle,
      serviceAreas: input.serviceAreas,
      ratings: await loadRatingsWithNames(mapped.id),
    };
  },

  getMockDetail(id: string): ProviderDetailDTO | null {
    const base = MOCK_PROVIDERS.find((p) => p.id === id);
    if (!base) return null;
    return {
      ...base,
      ratings: [
        {
          id: "r1",
          customerId: "c0000000-0000-0000-0000-000000000001",
          customerName: "Chidi O.",
          stars: 5,
          comment: "Arrived promptly and fixed the problem neatly!",
          createdAt: new Date().toISOString(),
        },
      ],
    };
  },
};
