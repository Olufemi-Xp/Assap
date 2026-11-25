import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/api-response";
import { AppError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { normalizeLocation } from "@/lib/constants/nigeria-locations";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** PATCH /api/profile/location { state, city, lga } — saves the customer's preferred discovery location. */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError();

    const body = await request.json().catch(() => ({}));
    const location = normalizeLocation(body);
    if (!location) throw new ValidationError("Select a valid State, City and Local Government.");

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("users")
      .update({
        state: location.state || null,
        city: location.city || null,
        lga: location.lga || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);
    if (error) throw new AppError(error.message, 500, "LOCATION_SAVE_ERROR");

    return apiOk({ location });
  } catch (error) {
    return apiError(error, "LOCATION_SAVE_ERROR");
  }
}
