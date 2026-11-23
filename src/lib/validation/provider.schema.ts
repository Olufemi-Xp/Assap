import { z } from "zod";
import { NIGERIA_STATE_VALUES } from "@/lib/constants/nigeria-states";
import { SERVICE_CATEGORY_VALUES } from "@/lib/constants/service-categories";

export const providerProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(140).trim(),
  serviceCategory: z.enum(SERVICE_CATEGORY_VALUES as [string, ...string[]]),
  serviceDescription: z.string().min(10, "Description must be at least 10 characters").max(1000).trim(),
  state: z.enum(NIGERIA_STATE_VALUES as [string, ...string[]]),
  locationArea: z.string().min(2, "Location area is required").max(120).trim(),
  phoneNumber: z.string().regex(/^\+?234\d{10}$|^0\d{10}$/, "Must be a valid Nigerian phone number"),
  whatsappNumber: z.string().regex(/^\+?234\d{10}$|^0\d{10}$/, "Must be a valid WhatsApp number"),
});

export const providerSearchQuerySchema = z.object({
  state: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;
export type ProviderSearchQuery = z.infer<typeof providerSearchQuerySchema>;
