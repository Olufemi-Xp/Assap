import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/services/ai-service";
import { z } from "zod";
import type { ApiResponse } from "@/types/api";

const aiAssistSchema = z.object({
  type: z.enum(["polish_bio", "match_category"]),
  prompt: z.string().min(3).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aiAssistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid assist request" } },
        { status: 400 }
      );
    }

    const result = await aiService.assist(parsed.data);

    return NextResponse.json<ApiResponse>({ ok: true, data: result });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "AI_ERROR", message: (error as Error).message } },
      { status: 500 }
    );
  }
}
