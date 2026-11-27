import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { paystackService } from "@/services/paystack-service";
import { subscriptionService } from "@/services/subscription-service";
import { AppError } from "@/lib/errors";
import type { ApiResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in to verify your renewal." } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";
    const providerId = typeof body.providerId === "string" ? body.providerId.trim() : "";

    if (!reference || !providerId) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Missing payment reference or provider ID." } },
        { status: 400 }
      );
    }

    const verification = await paystackService.verifyTransaction(reference);
    if (!verification.verified || verification.amountKobo < 100000) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "PAYMENT_NOT_VERIFIED", message: "Payment amount could not be verified." } },
        { status: 402 }
      );
    }

    await subscriptionService.extendSubscriptionFromPayment({
      providerId,
      paystackReference: reference,
      amountKobo: verification.amountKobo,
    });

    const updatedStatus = await subscriptionService.getStatusByProviderId(providerId);
    return NextResponse.json<ApiResponse>({ ok: true, data: { status: updatedStatus } });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const code = error instanceof AppError ? error.code : "PAYSTACK_VERIFY_ERROR";
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code, message: (error as Error).message } },
      { status }
    );
  }
}
