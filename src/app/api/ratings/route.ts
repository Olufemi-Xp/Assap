import { NextRequest, NextResponse } from "next/server";
import { ratingService } from "@/services/rating-service";
import { createRatingSchema } from "@/lib/validation/rating.schema";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createRatingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid rating input", details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    // In production, customerId is taken from auth session
    const customerId = "c0000000-0000-0000-0000-000000000001";
    const rating = await ratingService.submitRating({
      providerId: parsed.data.providerId,
      customerId,
      stars: parsed.data.stars,
      comment: parsed.data.comment,
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: rating });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "RATING_ERROR", message: (error as Error).message } },
      { status: 400 }
    );
  }
}
