import { z } from "zod";

const envSchema = z.object({
  // Client-Safe Variables
  NEXT_PUBLIC_APP_NAME: z.string().default("ASAP"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://ksmmpbqluzkumfuecddw.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbW1wYnFsdXprdW1mdWVjZGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0MjEzMDEsImV4cCI6MjExMDk5NzMwMX0.NjU7YrVWgex3AouKfw6cNchWx7XmnX1Jc-DYgIuIE88"),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1).default("pk_test_1c80d1effbe397cd70b1564860947689dcdf513e"),

  // Server-Only Secrets
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbW1wYnFsdXprdW1mdWVjZGR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTQyMTMwMSwiZXhwIjoyMTEwOTk3MzAxfQ.F9NzAf9VnR6MvwQaolqZzRDuuYvSIsi6YK9g9lCVc5Q"),
  PAYSTACK_SECRET_KEY: z.string().min(1).default("pk_test_1c80d1effbe397cd70b1564860947689dcdf513e"),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(1).default("pk_test_1c80d1effbe397cd70b1564860947689dcdf513e"),
  SUBSCRIPTION_MONTHLY_AMOUNT_NGN: z.coerce.number().int().positive().default(1000),
  FREE_TRIAL_DAYS: z.coerce.number().int().positive().default(30),
  OPENROUTER_API_KEY: z.string().default("placeholder-openrouter-key"),
  OPENROUTER_FREE_MODEL: z.string().default("meta-llama/llama-3.3-70b-instruct:free"),
  CRON_SECRET: z.string().default("placeholder-cron-secret"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,
  SUBSCRIPTION_MONTHLY_AMOUNT_NGN: process.env.SUBSCRIPTION_MONTHLY_AMOUNT_NGN,
  FREE_TRIAL_DAYS: process.env.FREE_TRIAL_DAYS,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_FREE_MODEL: process.env.OPENROUTER_FREE_MODEL,
  CRON_SECRET: process.env.CRON_SECRET,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
