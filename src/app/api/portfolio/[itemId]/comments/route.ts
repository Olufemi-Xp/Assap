import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk, UUID_RE } from "@/lib/api-response";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { portfolioCommentSchema } from "@/lib/validation/portfolio.schema";
import { portfolioService } from "@/services/portfolio-service";

export const dynamic = "force-dynamic";

/** GET /api/portfolio/:itemId/comments */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    if (!UUID_RE.test(itemId)) throw new NotFoundError("Portfolio item not found");
    const comments = await portfolioService.listComments(itemId);
    return apiOk({ comments });
  } catch (error) {
    return apiError(error, "PORTFOLIO_COMMENTS_ERROR");
  }
}

/** POST /api/portfolio/:itemId/comments  { body } */
export async function POST(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    if (!UUID_RE.test(itemId)) throw new NotFoundError("Portfolio item not found");
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError("Sign in to comment.");

    const parsed = portfolioCommentSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message || "Invalid comment");

    const comment = await portfolioService.addComment(session.user.id, session.fullName, itemId, parsed.data.body);
    return apiOk({ comment }, 201);
  } catch (error) {
    return apiError(error, "PORTFOLIO_COMMENT_ERROR");
  }
}
