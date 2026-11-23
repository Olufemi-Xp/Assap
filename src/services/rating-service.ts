import { createAdminClient } from "@/lib/supabase/admin";
import { AppError, ValidationError } from "@/lib/errors";

export interface SubmitRatingInput {
  providerId: string;
  customerId: string;
  stars: number;
  comment?: string | null;
}

export const ratingService = {
  async submitRating(input: SubmitRatingInput) {
    const admin = createAdminClient();

    // Verify customer is not rating their own provider profile
    const { data: profile } = await admin
      .from("provider_profiles")
      .select("user_id")
      .eq("id", input.providerId)
      .single();

    if (profile && profile.user_id === input.customerId) {
      throw new ValidationError("You cannot rate your own provider listing");
    }

    // Upsert rating
    const { data: rating, error } = await admin
      .from("ratings")
      .upsert(
        {
          provider_id: input.providerId,
          customer_id: input.customerId,
          stars: input.stars,
          comment: input.comment || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider_id,customer_id" }
      )
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500, "RATING_SUBMISSION_ERROR");
    }

    // Atomically recalculate average_rating and rating_count
    const { data: allRatings } = await admin
      .from("ratings")
      .select("stars")
      .eq("provider_id", input.providerId);

    if (allRatings && allRatings.length > 0) {
      const count = allRatings.length;
      const sum = allRatings.reduce((acc, curr) => acc + curr.stars, 0);
      const avg = Number((sum / count).toFixed(2));

      await admin
        .from("provider_profiles")
        .update({ average_rating: avg, rating_count: count })
        .eq("id", input.providerId);
    }

    return rating;
  },
};
