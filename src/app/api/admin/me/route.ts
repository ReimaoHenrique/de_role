import { NextRequest } from "next/server";
import { adminProxy } from "@/lib/admin-proxy";
import type { AdminSession } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return adminProxy<AdminSession>(request, "/api/admin/me");
}
