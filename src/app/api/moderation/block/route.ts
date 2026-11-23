import { NextRequest, NextResponse } from "next/server";
import { moderationService } from "@/services/moderation-service";
import { blockUserSchema } from "@/lib/validation/moderation.schema";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = blockUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid block input" } },
        { status: 400 }
      );
    }

    const blockerId = "c0000000-0000-0000-0000-000000000001";
    const block = await moderationService.blockUser(blockerId, parsed.data.blockedUserId);

    return NextResponse.json<ApiResponse>({ ok: true, data: block });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "MODERATION_ERROR", message: (error as Error).message } },
      { status: 400 }
    );
  }
}
