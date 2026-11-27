import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/api-response";
import { AppError, ForbiddenError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { createDbClient } from "@/lib/supabase/db";
import { PORTFOLIO_IMAGE_MAX_BYTES, PORTFOLIO_IMAGE_TYPES } from "@/lib/validation/portfolio.schema";

export const dynamic = "force-dynamic";

const BUCKET = "portfolio-images";

/**
 * POST /api/provider/business-card/image
 * Uploads a public business card image for the signed-in service provider.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session) throw new UnauthorizedError("Sign in to upload a business card image.");
    if (session.role !== "provider") {
      throw new ForbiddenError("Only service providers can upload a business card image.");
    }

    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      throw new ValidationError("Please select an image file to upload.");
    }

    if (!(PORTFOLIO_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      throw new ValidationError("Business card image must be a JPG, PNG, or WebP file.");
    }

    if (file.size > PORTFOLIO_IMAGE_MAX_BYTES) {
      throw new ValidationError("Business card image must be 5 MB or smaller.");
    }

    const db = await createDbClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    // First path segment must match auth.uid() to satisfy Supabase Storage RLS policies
    const path = `${session.user.id}/business-card-${crypto.randomUUID()}.${ext}`;

    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });

    if (error) {
      throw new AppError(`Image upload failed: ${error.message}`, 500, "BUSINESS_CARD_IMAGE_UPLOAD_ERROR");
    }

    const { data } = db.storage.from(BUCKET).getPublicUrl(path);
    return apiOk({ url: data.publicUrl });
  } catch (error) {
    return apiError(error, "BUSINESS_CARD_IMAGE_UPLOAD_ERROR");
  }
}
