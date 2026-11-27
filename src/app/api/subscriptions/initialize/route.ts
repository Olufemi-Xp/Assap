import { NextRequest, NextResponse } from "next/server";
import { paystackService } from "@/services/paystack-service";
import { env } from "@/lib/env";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const providerId = body.providerId || "pr000000-0000-0000-0000-000000000001";
    const email = body.email || "provider@asap.ng";
    const reference = `ASAP_SUB_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const origin = request.nextUrl.origin || env.NEXT_PUBLIC_APP_URL;
    const callbackUrl = `${origin}/provider/subscription?reference=${reference}`;

    const checkout = await paystackService.initializeTransaction({
      email,
      amountKobo: 100000, // ₦1,000 in kobo
      reference,
      callbackUrl,
      metadata: {
        providerId,
        planType: "monthly_1000_ngn",
      },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: checkout });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "PAYSTACK_INIT_ERROR", message: (error as Error).message } },
      { status: 500 }
    );
  }
}
