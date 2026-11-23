import { NextRequest, NextResponse } from "next/server";
import { providerService } from "@/services/provider-service";
import type { ApiResponse } from "@/types/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = await providerService.getProviderById(id);

    if (!provider) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "NOT_FOUND", message: "Provider not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: provider,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "INTERNAL_ERROR", message: (error as Error).message } },
      { status: 500 }
    );
  }
}
