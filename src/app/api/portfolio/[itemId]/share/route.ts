import { NextRequest } from "next/server";
import { apiError, apiOk, UUID_RE } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { portfolioService } from "@/services/portfolio-service";

/** POST /api/portfolio/:itemId/share — records that a portfolio item was shared. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    if (!UUID_RE.test(itemId)) throw new NotFoundError("Portfolio item not found");
    const result = await portfolioService.recordShare(itemId);
    return apiOk(result);
  } catch (error) {
    return apiError(error, "PORTFOLIO_SHARE_ERROR");
  }
}
