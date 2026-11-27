import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk, UUID_RE } from "@/lib/api-response";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { portfolioService } from "@/services/portfolio-service";

/** PATCH /api/portfolio/:itemId — provider edits or toggles visibility of one of their own portfolio items. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    if (!UUID_RE.test(itemId)) throw new NotFoundError("Portfolio item not found");
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError();

    const body = await request.json();
    const updated = await portfolioService.updateItem(session.user.id, itemId, {
      title: typeof body.title === "string" ? body.title : undefined,
      deliveryStory: typeof body.deliveryStory === "string" ? body.deliveryStory : undefined,
      jobLocation: body.jobLocation !== undefined ? body.jobLocation : undefined,
      completedOn: body.completedOn !== undefined ? body.completedOn : undefined,
      duration: body.duration !== undefined ? body.duration : undefined,
      extraDetails: body.extraDetails !== undefined ? body.extraDetails : undefined,
      isVisible: typeof body.isVisible === "boolean" ? body.isVisible : undefined,
    });

    return apiOk({ item: updated });
  } catch (error) {
    return apiError(error, "PORTFOLIO_UPDATE_ERROR");
  }
}

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
