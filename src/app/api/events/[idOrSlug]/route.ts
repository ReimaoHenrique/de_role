import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { gatewayRequest } from "@/lib/gateway";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await context.params;
    const result = await gatewayRequest<Event>(
      `/api/events/${encodeURIComponent(idOrSlug)}`
    );
    return successResponse(result.data, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
