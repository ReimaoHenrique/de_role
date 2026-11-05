import { NextResponse } from "next/server";
import { GatewayError } from "@/lib/gateway";
import type { ApiMeta } from "@/types";

export function successResponse<T>(
  data: T,
  meta?: ApiMeta,
  status = 200
): NextResponse {
  return NextResponse.json(
    meta ? { success: true, data, meta } : { success: true, data },
    { status }
  );
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof GatewayError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      },
      { status: error.status }
    );
  }

  console.error("Erro inesperado no proxy do gateway:", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Não foi possível concluir a solicitação. Tente novamente.",
      },
    },
    { status: 500 }
  );
}
