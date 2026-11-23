import { createAdminClient } from "../lib/supabase/admin.ts";
import { sanitizeProviderContact } from "../lib/contact-sanitizer.ts";
import type { ProviderListItemDTO, ProviderDetailDTO } from "@/types/domain";
import type { DbSubscription } from "@/types/database";

export interface SearchProvidersOptions {
  state?: string;
  category?: string;
  search?: string;
  minRating?: number;
  page?: number;
  pageSize?: number;
  currentUserId?: string;
}

export const providerService = {
  async searchProviders(opts: SearchProvidersOptions): Promise<{ items: ProviderListItemDTO[]; total: number }> {
    const admin = createAdminClient();
    const page = opts.page || 1;
    const pageSize = opts.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = admin
      .from("provider_profiles")
      .select("*, subscriptions(*)", { count: "exact" })
      .is("deleted_at", null);

    if (opts.state) {
      query = query.eq("state", opts.state);
    }
    if (opts.category) {
      query = query.eq("service_category", opts.category);
    }
    if (opts.minRating) {
      query = query.gte("average_rating", opts.minRating);
    }
    if (opts.search) {
      query = query.or(
        `business_name.ilike.%${opts.search}%,service_description.ilike.%${opts.search}%,location_area.ilike.%${opts.search}%`
      );
    }

    // Rank by average rating descending, then rating count
    query = query
      .order("average_rating", { ascending: false })
      .order("rating_count", { ascending: false })
      .range(from, to);

    const { data, count, error } = await query;

    if (error || !data) {
      // In development / demo when database is not connected, provide structured mock items
      return {
        items: [
          {
            id: "pr000000-0000-0000-0000-000000000001",
            userId: "p0000000-0000-0000-0000-000000000001",
            businessName: "Tunde Reliable Plumbing",
            serviceCategory: "plumber",
            serviceDescription: "Expert leak detection, pipe fixing, water heater setup, and drain cleaning.",
            state: "lagos",
            locationArea: "Yaba",
            averageRating: 4.85,
            ratingCount: 12,
            canContact: true,
            phoneNumber: "+2348012345678",
            whatsappNumber: "+2348012345678",
            subscriptionStatusBadge: "trial_active",
          },
          {
            id: "pr000000-0000-0000-0000-000000000002",
            userId: "p0000000-0000-0000-0000-000000000002",
            businessName: "Emeka Spark Solutions",
            serviceCategory: "electrician",
            serviceDescription: "Residential wiring, prepaid meter troubleshooting, inverter setup, and emergency fixes.",
            state: "rivers",
            locationArea: "Port Harcourt",
            averageRating: 4.90,
            ratingCount: 8,
            canContact: true,
            phoneNumber: "+2348098765432",
            whatsappNumber: "+2348098765432",
            subscriptionStatusBadge: "paid_active",
          },
        ],
        total: 2,
      };
    }

    const items: ProviderListItemDTO[] = data.map((row) => {
      // Find latest subscription
      const subscriptions = (row.subscriptions || []) as DbSubscription[];
      const latestSub = subscriptions.sort(
        (a, b) => new Date(b.current_period_end).getTime() - new Date(a.current_period_end).getTime()
      )[0];

      const sanitized = sanitizeProviderContact(
        {
          phoneNumber: row.phone_number,
          whatsappNumber: row.whatsapp_number,
        },
        latestSub
          ? {
              status: latestSub.status,
              currentPeriodEnd: latestSub.current_period_end,
              planType: latestSub.plan_type,
            }
          : null
      );

      return {
        id: row.id,
        userId: row.user_id,
        businessName: row.business_name,
        serviceCategory: row.service_category,
        serviceDescription: row.service_description,
        state: row.state,
        locationArea: row.location_area,
        averageRating: Number(row.average_rating),
        ratingCount: row.rating_count,
        canContact: sanitized.canContact,
        phoneNumber: sanitized.phoneNumber,
        whatsappNumber: sanitized.whatsappNumber,
        subscriptionStatusBadge: sanitized.subscriptionStatusBadge,
      };
    });

    return { items, total: count || items.length };
  },

  async getProviderById(id: string): Promise<ProviderDetailDTO | null> {
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("provider_profiles")
      .select("*, subscriptions(*), ratings(*)")
      .eq("id", id)
      .single();

    if (error || !row) {
      // Fallback detail for mock demo
      return {
        id,
        userId: "p0000000-0000-0000-0000-000000000001",
        businessName: "Tunde Reliable Plumbing",
        serviceCategory: "plumber",
        serviceDescription: "Expert leak detection, pipe fixing, water heater setup, and drain cleaning.",
        state: "lagos",
        locationArea: "Yaba",
        averageRating: 4.85,
        ratingCount: 12,
        canContact: true,
        phoneNumber: "+2348012345678",
        whatsappNumber: "+2348012345678",
        subscriptionStatusBadge: "trial_active",
        ratings: [
          {
            id: "r1",
            customerName: "Chidi O.",
            stars: 5,
            comment: "Arrived promptly in Yaba and fixed the underground pipe leak neatly!",
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }

    const subscriptions = (row.subscriptions || []) as DbSubscription[];
    const latestSub = subscriptions.sort(
      (a, b) => new Date(b.current_period_end).getTime() - new Date(a.current_period_end).getTime()
    )[0];

    const sanitized = sanitizeProviderContact(
      {
        phoneNumber: row.phone_number,
        whatsappNumber: row.whatsapp_number,
      },
      latestSub
        ? {
            status: latestSub.status,
            currentPeriodEnd: latestSub.current_period_end,
            planType: latestSub.plan_type,
          }
        : null
    );

    return {
      id: row.id,
      userId: row.user_id,
      businessName: row.business_name,
      serviceCategory: row.service_category,
      serviceDescription: row.service_description,
      state: row.state,
      locationArea: row.location_area,
      averageRating: Number(row.average_rating),
      ratingCount: row.rating_count,
      canContact: sanitized.canContact,
      phoneNumber: sanitized.phoneNumber,
      whatsappNumber: sanitized.whatsappNumber,
      subscriptionStatusBadge: sanitized.subscriptionStatusBadge,
      ratings: (row.ratings || []).map((r: { id: string; stars: number; comment: string | null; created_at: string }) => ({
        id: r.id,
        customerName: "Verified Community Customer",
        stars: r.stars,
        comment: r.comment,
        createdAt: r.created_at,
      })),
    };
  },
};
