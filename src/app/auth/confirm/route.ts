import { GET as callbackGet } from "../callback/route";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return callbackGet(request);
}
