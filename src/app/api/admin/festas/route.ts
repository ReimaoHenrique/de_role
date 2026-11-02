import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL ?? "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Acesso negado. Token inválido." },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_GATEWAY_URL}/api/admin/festas`, {
      headers: { Authorization: authorization, Accept: "application/json" },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro ao buscar festas:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro interno do servidor. Tente novamente." },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash } = body;

    if (!hash) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Hash de acesso obrigatório." },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_GATEWAY_URL}/api/admin/festas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash }),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro no login admin:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro interno do servidor. Tente novamente." },
      { status: 503 }
    );
  }
}
