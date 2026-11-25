import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk, UUID_RE } from "@/lib/api-response";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { portfolioService } from "@/services/portfolio-service";

/** POST /api/portfolio/:itemId/like — toggles the viewer's like. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    if (!UUID_RE.test(itemId)) throw new NotFoundError("Portfolio item not found");
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError("Sign in to like portfolio work.");
    const result = await portfolioService.toggleLike(session.user.id, itemId);
    return apiOk(result);
  } catch (error) {
    return apiError(error, "PORTFOLIO_LIKE_ERROR");
  }
}
