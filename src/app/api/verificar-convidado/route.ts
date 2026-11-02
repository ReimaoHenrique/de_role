import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email && !body.cpf) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Por favor, forneça pelo menos um campo (email ou CPF).",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_GATEWAY_URL}/api/verificar-convidado`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro ao verificar convidado:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao conectar com o servidor. Tente novamente.",
      },
      { status: 503 }
    );
  }
}
