import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/api-response";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { providerBusinessCardSchema } from "@/lib/validation/provider.schema";
import { providerService } from "@/services/provider-service";

export const dynamic = "force-dynamic";

/** GET /api/provider/business-card — returns the signed-in provider's business card. */
export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError();
    if (session.role !== "provider") throw new ForbiddenError("Only service providers have a business card.");

    const provider = await providerService.getProviderByUserId(session.user.id);
    return apiOk({ provider });
  } catch (error) {
    return apiError(error, "BUSINESS_CARD_FETCH_ERROR");
  }
}

/** PATCH /api/provider/business-card — creates or updates the provider's Service Business Card & Service Areas. */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError("Sign in to update your Service Business Card.");
    if (session.role !== "provider") throw new ForbiddenError("Only service providers can manage a business card.");

    const body = await request.json().catch(() => ({}));
    const parsed = providerBusinessCardSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Invalid business card details";
      throw new ValidationError(first, parsed.error.flatten());
    }

    const provider = await providerService.upsertBusinessCard(
      session.user.id,
      session.user.email || "",
      parsed.data
    );
    return apiOk({ provider });
  } catch (error) {
    return apiError(error, "BUSINESS_CARD_SAVE_ERROR");
  }
}
