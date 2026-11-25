import { z } from "zod";
import { NIGERIA_STATE_VALUES } from "@/lib/constants/nigeria-states";
import { SERVICE_CATEGORY_VALUES } from "@/lib/constants/service-categories";

export const serviceAreaItemSchema = z
  .string()
  .trim()
  .min(2, "Each service area must be at least 2 characters")
  .max(100, "Service area cannot exceed 100 characters");

const normalizePhone = (v: string) => v.replace(/[\s()-]/g, "").trim();

export const providerBusinessCardSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required").max(140),
  serviceTitle: z.string().trim().min(2, "Service title is required (e.g. Electrician, Fashion Designer)").max(140),
  serviceCategory: z.enum(SERVICE_CATEGORY_VALUES as [string, ...string[]]),
  serviceAreas: z
    .array(serviceAreaItemSchema)
    .min(1, "Add at least one service area or task you handle")
    .max(25, "Maximum 25 service areas"),
  serviceDescription: z.string().trim().max(1000).optional().default(""),
  state: z.enum(NIGERIA_STATE_VALUES as [string, ...string[]]),
  city: z.string().trim().max(120).optional().nullable(),
  lga: z.string().trim().max(120).optional().nullable(),
  locationArea: z.string().trim().max(120).optional().default(""),
  phoneNumber: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^\+?234\d{10}$|^0\d{10}$/, "Phone must be a valid Nigerian number (e.g. 08012345678 or +2348012345678)")),
  whatsappNumber: z
    .string()
    .optional()
    .default("")
    .transform(normalizePhone)
    .refine(
      (v) => v === "" || /^\+?234\d{10}$|^0\d{10}$/.test(v),
      "WhatsApp must be a valid Nigerian number (e.g. 08012345678 or +2348012345678)"
    ),
});

export const providerProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(140).trim(),
  serviceTitle: z.string().min(2).max(140).trim().optional(),
  serviceCategory: z.enum(SERVICE_CATEGORY_VALUES as [string, ...string[]]),
  serviceDescription: z.string().min(10, "Description must be at least 10 characters").max(1000).trim(),
  serviceAreas: z.array(serviceAreaItemSchema).max(25).optional(),
  state: z.enum(NIGERIA_STATE_VALUES as [string, ...string[]]),
  locationArea: z.string().min(2, "Location area is required").max(120).trim(),
  phoneNumber: z.string().regex(/^\+?234\d{10}$|^0\d{10}$/, "Must be a valid Nigerian phone number"),
  whatsappNumber: z.string().regex(/^\+?234\d{10}$|^0\d{10}$/, "Must be a valid WhatsApp number"),
});

export const providerSearchQuerySchema = z.object({
  state: z.string().optional(),
  city: z.string().max(120).optional(),
  lga: z.string().max(120).optional(),
  category: z.string().optional(),
  search: z.string().max(120).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;
export type ProviderBusinessCardInput = z.infer<typeof providerBusinessCardSchema>;
export type ProviderSearchQuery = z.infer<typeof providerSearchQuerySchema>;
