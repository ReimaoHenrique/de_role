import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { gatewayRequest } from "@/lib/gateway";
import type { Guest } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Informe e-mail, CPF ou nome para consultar.",
          },
        },
        { status: 400 }
      );
    }

    const result = await gatewayRequest<Guest>("/api/guests/lookup", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return successResponse(result.data, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
