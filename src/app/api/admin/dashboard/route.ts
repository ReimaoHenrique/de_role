import { NextRequest } from "next/server";
import { adminProxy } from "@/lib/admin-proxy";
import type { DashboardData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return adminProxy<DashboardData>(request, "/api/admin/dashboard");
}
