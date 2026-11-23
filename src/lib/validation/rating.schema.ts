import { z } from "zod";

export const createRatingSchema = z.object({
  providerId: z.string().uuid("Invalid provider ID"),
  stars: z.number().int().min(1, "Minimum rating is 1 star").max(5, "Maximum rating is 5 stars"),
  comment: z.string().max(500, "Review comment cannot exceed 500 characters").optional().nullable(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
