import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk, UUID_RE } from "@/lib/api-response";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { portfolioService } from "@/services/portfolio-service";

/** DELETE /api/portfolio/:itemId — provider removes one of their own portfolio items. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    if (!UUID_RE.test(itemId)) throw new NotFoundError("Portfolio item not found");
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError();
    await portfolioService.deleteItem(session.user.id, itemId);
    return apiOk({ deleted: true });
  } catch (error) {
    return apiError(error, "PORTFOLIO_DELETE_ERROR");
  }
}
