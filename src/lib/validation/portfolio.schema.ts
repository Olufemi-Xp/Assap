import { z } from "zod";

export const PORTFOLIO_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PORTFOLIO_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const createPortfolioItemSchema = z.object({
  title: z.string().trim().min(3, "Work title must be at least 3 characters").max(140),
  deliveryStory: z
    .string()
    .trim()
    .min(20, "Tell customers how you delivered the job (at least 20 characters)")
    .max(3000),
  jobLocation: optionalText(140),
  completedOn: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Completion date must be YYYY-MM-DD"),
  duration: optionalText(60),
  extraDetails: optionalText(1000),
});

export const portfolioCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(500, "Comment cannot exceed 500 characters"),
});

export type CreatePortfolioItemInput = z.infer<typeof createPortfolioItemSchema>;
