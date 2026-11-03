import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeCpf } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email ? body.email.trim().toLowerCase() : null;
    const cpf = body.cpf ? normalizeCpf(body.cpf) : null;

    if (!email && !cpf) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Por favor, forneça pelo menos um campo (email ou CPF).",
        },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(cpf ? [{ cpf }] : []),
        ],
      },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!guest) {
      return NextResponse.json({
        sucesso: false,
        mensagem: "Convidado não encontrado.",
      });
    }

    const statusMap: Record<string, string> = {
      ACTIVE: "confirmado",
      USED: "utilizado",
      CANCELLED: "cancelado",
    };

    return NextResponse.json({
      sucesso: true,
      mensagem: "Convidado encontrado.",
      data: {
        status: statusMap[guest.status] || "confirmado",
        evento: {
          nome: guest.event.name,
          data: guest.event.startsAt.toISOString(),
          local: guest.event.venue,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao verificar convidado:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao consultar banco de dados. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
