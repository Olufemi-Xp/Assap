import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export async function GET() {
  const response: ApiResponse<{
    status: string;
    version: string;
    timestamp: string;
  }> = {
    ok: true,
    data: {
      status: "healthy",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response);
}
