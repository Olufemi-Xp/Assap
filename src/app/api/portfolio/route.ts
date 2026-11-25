import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk, UUID_RE } from "@/lib/api-response";
import { UnauthorizedError, ValidationError, ForbiddenError } from "@/lib/errors";
import { createPortfolioItemSchema } from "@/lib/validation/portfolio.schema";
import { portfolioService } from "@/services/portfolio-service";

export const dynamic = "force-dynamic";

/** GET /api/portfolio?providerId=<uuid> — public list of a provider's delivered jobs. */
export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get("providerId") || "";
    if (!UUID_RE.test(providerId)) {
      // Demo / mock listings have no portfolio records.
      return apiOk({ items: [] });
    }
    const session = await getSessionContext();
    const items = await portfolioService.listByProvider(providerId, session?.user.id ?? null);
    return apiOk({ items });
  } catch (error) {
    return apiError(error, "PORTFOLIO_LIST_ERROR");
  }
}

/** POST /api/portfolio (multipart/form-data) — provider adds a delivered job with before/after images. */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError("Sign in to manage your portfolio.");
    if (session.role !== "provider") throw new ForbiddenError("Only service providers can add portfolio work.");

    const form = await request.formData();
    const text = (key: string) => {
      const v = form.get(key);
      return typeof v === "string" ? v : undefined;
    };
    const file = (key: string) => {
      const v = form.get(key);
      return v instanceof File ? v : null;
    };

    const parsed = createPortfolioItemSchema.safeParse({
      title: text("title"),
      deliveryStory: text("deliveryStory"),
      jobLocation: text("jobLocation"),
      completedOn: text("completedOn"),
      duration: text("duration"),
      extraDetails: text("extraDetails"),
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Invalid portfolio details";
      throw new ValidationError(first, parsed.error.flatten());
    }

    const item = await portfolioService.createItem(session.user.id, parsed.data, {
      before: file("beforeImage"),
      after: file("afterImage"),
    });
    return apiOk({ item }, 201);
  } catch (error) {
    return apiError(error, "PORTFOLIO_CREATE_ERROR");
  }
}
