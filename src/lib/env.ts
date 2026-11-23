import { z } from "zod";

const envSchema = z.object({
  // Client-Safe Variables
  NEXT_PUBLIC_APP_NAME: z.string().default("ASAP"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("placeholder-anon-key"),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1).default("pk_test_placeholder"),

  // Server-Only Secrets
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default("placeholder-service-role-key"),
  PAYSTACK_SECRET_KEY: z.string().min(1).default("sk_test_placeholder"),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(1).default("placeholder-webhook-secret"),
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
