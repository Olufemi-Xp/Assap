import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { paystackService } from "@/services/paystack-service";
import { providerService } from "@/services/provider-service";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import type { ApiResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const session = await getSessionContext();

    let providerId: string | undefined =
      typeof body.providerId === "string" && body.providerId.trim() ? body.providerId.trim() : undefined;
    let email: string | undefined =
      typeof body.email === "string" && body.email.includes("@") ? body.email.trim() : undefined;

    if (session) {
      email = email || session.user.email || undefined;
      if (!providerId) {
        const profile = await providerService.getProviderByUserId(session.user.id);
        providerId = profile?.id;
      }
    }

    if (!providerId || !email) {
      return NextResponse.json<ApiResponse>(
        {
          ok: false,
          error: {
            code: "SUBSCRIPTION_CONTEXT_MISSING",
            message: "Complete your Service Provider profile before renewing your subscription.",
          },
        },
        { status: 400 }
      );
    }

    const reference = `ASAP_SUB_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const origin = request.nextUrl.origin || env.NEXT_PUBLIC_APP_URL;
    const callbackUrl = `${origin}/provider/subscription?reference=${reference}`;

    const checkout = await paystackService.initializeTransaction({
      email,
      amountKobo: env.SUBSCRIPTION_MONTHLY_AMOUNT_NGN * 100,
      reference,
      callbackUrl,
      metadata: {
        providerId,
        planType: "monthly_1000_ngn",
      },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: checkout });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const code = error instanceof AppError ? error.code : "PAYSTACK_INIT_ERROR";
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code, message: (error as Error).message } },
      { status }
    );
  }
}
