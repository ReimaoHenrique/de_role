import { NextRequest } from "next/server";
import { adminProxy } from "@/lib/admin-proxy";
import type { Guest } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return adminProxy<Guest>(
    request,
    `/api/admin/guests/${encodeURIComponent(id)}/cancel`,
    { method: "POST" }
  );
}
