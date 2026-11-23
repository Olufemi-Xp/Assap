import { NextRequest, NextResponse } from "next/server";
import { moderationService } from "@/services/moderation-service";
import { reportSchema } from "@/lib/validation/moderation.schema";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid report data" } },
        { status: 400 }
      );
    }

    const reporterId = "c0000000-0000-0000-0000-000000000001";
    const report = await moderationService.submitReport({
      reporterId,
      reportedUserId: parsed.data.reportedUserId,
      reason: parsed.data.reason,
      details: parsed.data.details,
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: report });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "MODERATION_ERROR", message: (error as Error).message } },
      { status: 400 }
    );
  }
}
