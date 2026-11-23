import { z } from "zod";

export const reportSchema = z.object({
  reportedUserId: z.string().uuid("Invalid reported user ID"),
  reason: z.enum([
    "fraud_or_scam",
    "fake_profile_or_id",
    "harassment_or_abuse",
    "misleading_service",
    "other",
  ]),
  details: z.string().max(1000).optional().nullable(),
});

export const blockUserSchema = z.object({
  blockedUserId: z.string().uuid("Invalid blocked user ID"),
});

export type ReportInput = z.infer<typeof reportSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
