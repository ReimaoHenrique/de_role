import { NextRequest } from "next/server";
import { adminProxy } from "@/lib/admin-proxy";
import { buildQuery } from "@/lib/gateway";
import type { GuestStats } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId") ?? undefined;
  const query = buildQuery({ eventId });

  return adminProxy<GuestStats>(request, `/api/admin/guests/stats${query}`);
}
