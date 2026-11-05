import { NextRequest, NextResponse } from "next/server";
import { adminProxy } from "@/lib/admin-proxy";
import { buildQuery } from "@/lib/gateway";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = buildQuery({
    page: params.get("page") ?? undefined,
    limit: params.get("limit") ?? undefined,
    status: params.get("status") ?? undefined,
    search: params.get("search") ?? undefined,
  });

  return adminProxy<Event[]>(request, `/api/admin/events${query}`);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Envie os dados do evento em formato JSON.",
        },
      },
      { status: 400 }
    );
  }

  return adminProxy<Event>(request, "/api/admin/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
