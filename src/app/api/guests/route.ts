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
            message: "Envie os dados da inscrição em formato JSON.",
          },
        },
        { status: 400 }
      );
    }

    const result = await gatewayRequest<Guest>("/api/guests", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return successResponse(result.data, result.meta, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
