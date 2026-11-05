import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { gatewayRequest } from "@/lib/gateway";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
} from "@/lib/session";

export const dynamic = "force-dynamic";

interface LoginPayload {
  token: string;
  expiresAt: string;
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const hash =
      typeof body === "object" && body !== null && typeof body.hash === "string"
        ? body.hash.trim()
        : "";

    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Informe o hash SHA-256 da senha.",
          },
        },
        { status: 400 }
      );
    }

    const result = await gatewayRequest<LoginPayload>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ hash }),
    });

    const { token, expiresAt, sessionId } = result.data;
    const response = NextResponse.json({
      success: true,
      data: { expiresAt, sessionId },
    });

    // O token nunca volta para o JavaScript do browser.
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      token,
      adminSessionCookieOptions(expiresAt)
    );

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
