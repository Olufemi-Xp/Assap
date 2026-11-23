import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/services/subscription-service";
import type { ApiResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get("providerId") || "pr000000-0000-0000-0000-000000000001";
    const status = await subscriptionService.getStatusByProviderId(providerId);

    return NextResponse.json<ApiResponse>({ ok: true, data: status });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "SUBSCRIPTION_STATUS_ERROR", message: (error as Error).message } },
      { status: 500 }
    );
  }
}
