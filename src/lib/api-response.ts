import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import type { ApiResponse } from "@/types/api";

/** Converts any thrown error into a consistent JSON ApiResponse. */
export function apiError(error: unknown, fallbackCode = "INTERNAL_ERROR") {
  if (error instanceof AppError) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: error.code, message: error.message, details: error.details } },
      { status: error.statusCode }
    );
  }
  return NextResponse.json<ApiResponse>(
    { ok: false, error: { code: fallbackCode, message: (error as Error)?.message || "Unexpected error" } },
    { status: 500 }
  );
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data }, { status });
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
