import { NextRequest } from "next/server";
import { adminProxy } from "@/lib/admin-proxy";
import { buildQuery } from "@/lib/gateway";
import type { Guest } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = buildQuery({
    page: params.get("page") ?? undefined,
    limit: params.get("limit") ?? undefined,
    eventId: params.get("eventId") ?? undefined,
    status: params.get("status") ?? undefined,
    search: params.get("search") ?? undefined,
  });

  return adminProxy<Guest[]>(request, `/api/admin/guests${query}`);
}
