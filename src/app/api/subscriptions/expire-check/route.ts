import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/services/subscription-service";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (process.env.NODE_ENV === "production" && token !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await subscriptionService.runZeroGraceExpiryCheck();
  return NextResponse.json({ ok: true, data: result });
}
