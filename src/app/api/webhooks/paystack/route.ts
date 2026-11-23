import { NextRequest, NextResponse } from "next/server";
import { paystackService } from "@/services/paystack-service";
import { subscriptionService } from "@/services/subscription-service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    const isValid = paystackService.verifyWebhookSignature(rawBody, signature);

    if (!isValid && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference, metadata, amount } = event.data;
      const providerId = metadata?.providerId;

      if (providerId && amount >= 100000) {
        await subscriptionService.extendSubscriptionFromPayment({
          providerId,
          paystackReference: reference,
          amountKobo: amount,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
