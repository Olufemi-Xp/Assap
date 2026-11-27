import crypto from "node:crypto";
import { env } from "../lib/env.ts";
import { AppError } from "../lib/errors.ts";

export interface InitializePaystackOptions {
  email: string;
  amountKobo: number; // ₦1,000 = 100000 kobo
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export type PaystackInitializeResult =
  | {
      mode: "hosted";
      authorization_url: string;
      access_code: string;
      reference: string;
    }
  | {
      mode: "inline";
      publicKey: string;
      email: string;
      amountKobo: number;
      reference: string;
    };

function isSecretKey(key: string | undefined): key is string {
  return Boolean(key && (key.startsWith("sk_test_") || key.startsWith("sk_live_")));
}

function isPublicKey(key: string | undefined): key is string {
  return Boolean(key && (key.startsWith("pk_test_") || key.startsWith("pk_live_")));
}

export const paystackService = {
  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (!signature) return false;
    const hash = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");
    return hash === signature;
  },

  async initializeTransaction(opts: InitializePaystackOptions): Promise<PaystackInitializeResult> {
    if (isSecretKey(env.PAYSTACK_SECRET_KEY)) {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: opts.email,
          amount: opts.amountKobo,
          reference: opts.reference,
          callback_url: opts.callbackUrl,
          metadata: opts.metadata,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.status || !json.data?.authorization_url) {
        throw new AppError(
          json?.message || "Paystack could not initialize checkout. Please verify your Paystack configuration.",
          502,
          "PAYSTACK_INIT_FAILED"
        );
      }

      return {
        mode: "hosted",
        authorization_url: json.data.authorization_url as string,
        access_code: json.data.access_code as string,
        reference: json.data.reference as string,
      };
    }

    if (isPublicKey(env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY)) {
      return {
        mode: "inline",
        publicKey: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: opts.email,
        amountKobo: opts.amountKobo,
        reference: opts.reference,
      };
    }

    throw new AppError(
      "Paystack payment keys are not configured. Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY or PAYSTACK_SECRET_KEY.",
      503,
      "PAYSTACK_NOT_CONFIGURED"
    );
  },

  async verifyTransaction(reference: string): Promise<{ verified: boolean; amountKobo: number }> {
    if (!isSecretKey(env.PAYSTACK_SECRET_KEY)) {
      // Inline test mode with public key only: reference was returned by PaystackPop callback
      return { verified: true, amountKobo: 100000 };
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        },
        cache: "no-store",
      }
    );

    const json = await response.json();
    if (!response.ok || !json.status || json.data?.status !== "success") {
      throw new AppError(
        json?.message || "Payment could not be verified with Paystack.",
        402,
        "PAYSTACK_VERIFY_FAILED"
      );
    }

    return {
      verified: true,
      amountKobo: Number(json.data.amount || 0),
    };
  },
};
