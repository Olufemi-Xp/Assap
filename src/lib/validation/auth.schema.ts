import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z.string().email("Please provide a valid email address").toLowerCase().trim(),
  role: z.enum(["customer", "provider"]).default("customer"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
  role: z.enum(["customer", "provider"]).default("customer"),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
