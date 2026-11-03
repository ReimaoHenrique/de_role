import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  signAdminToken,
  toLegacyFesta,
  verifyAdminHash,
  verifyAdminToken,
} from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const hash = body.hash?.trim();

    if (!hash) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Hash de acesso obrigatório." },
        { status: 400 }
      );
    }

    if (!verifyAdminHash(hash)) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Hash de acesso inválido." },
        { status: 401 }
      );
    }

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas

    const session = await prisma.adminSession.create({
      data: {
        tokenId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt,
      },
    });

    const token = signAdminToken(session.id);

    return NextResponse.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      token,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Erro no login administrativo:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro interno no servidor ao realizar login." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Acesso negado. Token inválido ou expirado." },
        { status: 401 }
      );
    }

    const events = await prisma.event.findMany({
      orderBy: {
        startsAt: "desc",
      },
    });

    const festas = events.map(toLegacyFesta);

    const festasAtivas = festas.filter((f) => f.status === "ativa").length;
    const festasFinalizadas = festas.filter((f) => f.status === "finalizada").length;
    const lucroTotal = festas.reduce((sum, f) => sum + f.lucroAtual, 0);

    return NextResponse.json({
      sucesso: true,
      data: festas,
      resumo: {
        totalFestas: festas.length,
        festasAtivas,
        festasFinalizadas,
        lucroTotal: Number(lucroTotal.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard administrativo:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro ao consultar dados administrativos." },
      { status: 500 }
    );
  }
}
