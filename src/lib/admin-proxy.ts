import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { GatewayError, gatewayRequest } from "@/lib/gateway";
import {
  ADMIN_SESSION_COOKIE,
  clearedAdminSessionCookieOptions,
} from "@/lib/session";

function unauthorized(message: string): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: { code: "UNAUTHORIZED", message },
    },
    { status: 401 }
  );
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    "",
    clearedAdminSessionCookieOptions()
  );
  return response;
}

/**
 * Proxy fino das rotas administrativas: lê o JWT do cookie httpOnly e injeta
 * o header Authorization antes de chamar o gateway.
 */
export async function adminProxy<T>(
  request: NextRequest,
  path: string,
  init: RequestInit = {}
): Promise<NextResponse> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return unauthorized("Sua sessão expirou. Faça login novamente.");
  }

  try {
    const result = await gatewayRequest<T>(path, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
      },
    });

    return successResponse(
      result.data,
      result.meta,
      result.status === 201 ? 201 : 200
    );
  } catch (error) {
    if (error instanceof GatewayError && error.status === 401) {
      return unauthorized(error.message);
    }
    return errorResponse(error);
  }
}
