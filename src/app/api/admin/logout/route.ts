import { NextRequest, NextResponse } from "next/server";
import { gatewayRequest } from "@/lib/gateway";
import {
  ADMIN_SESSION_COOKIE,
  clearedAdminSessionCookieOptions,
} from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    // Revoga a sessão no backend; o cookie é limpo mesmo se a chamada falhar.
    await gatewayRequest("/api/admin/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  const response = NextResponse.json({
    success: true,
    data: { loggedOut: true },
  });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    "",
    clearedAdminSessionCookieOptions()
  );

  return response;
}
