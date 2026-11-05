import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { buildQuery, gatewayRequest } from "@/lib/gateway";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const query = buildQuery({
      page: params.get("page") ?? undefined,
      limit: params.get("limit") ?? undefined,
      status: params.get("status") ?? undefined,
      search: params.get("search") ?? undefined,
    });

    const result = await gatewayRequest<Event[]>(`/api/events${query}`);
    return successResponse(result.data, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
