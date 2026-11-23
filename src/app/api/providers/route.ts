import { NextRequest, NextResponse } from "next/server";
import { providerService } from "@/services/provider-service";
import { providerSearchQuerySchema } from "@/lib/validation/provider.schema";
import type { ApiResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = providerSearchQuerySchema.safeParse({
      state: searchParams.get("state") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      minRating: searchParams.get("minRating") || undefined,
      page: searchParams.get("page") || 1,
      pageSize: searchParams.get("pageSize") || 20,
    });

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid query parameters" } },
        { status: 400 }
      );
    }

    const result = await providerService.searchProviders(parsed.data);

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "INTERNAL_ERROR", message: (error as Error).message } },
      { status: 500 }
    );
  }
}
