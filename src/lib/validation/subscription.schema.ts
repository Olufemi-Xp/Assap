import { z } from "zod";

export const initializeSubscriptionSchema = z.object({
  providerId: z.string().uuid("Invalid provider ID"),
  returnUrl: z.string().url("Invalid return URL").optional(),
});

export type InitializeSubscriptionInput = z.infer<typeof initializeSubscriptionSchema>;
