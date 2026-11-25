import { NextRequest } from "next/server";
import { ratingService } from "@/services/rating-service";
import { createRatingSchema } from "@/lib/validation/rating.schema";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/api-response";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/lib/errors";

/** POST /api/ratings { providerId, stars (1-5), comment } — customer leaves or updates a review. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError("Sign in to leave a review.");
    if (session.role !== "customer") throw new ForbiddenError("Only customer accounts can leave reviews.");

    const parsed = createRatingSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message || "Invalid rating input", parsed.error.flatten());
    }

    const rating = await ratingService.submitRating({
      providerId: parsed.data.providerId,
      customerId: session.user.id,
      stars: parsed.data.stars,
      comment: parsed.data.comment?.trim() || null,
    });

    return apiOk(rating);
  } catch (error) {
    return apiError(error, "RATING_ERROR");
  }
}
