import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeCpf } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email ? body.email.trim().toLowerCase() : null;
    const cpf = body.cpf ? normalizeCpf(body.cpf) : null;
    const hash = body.hash?.trim() || body.ticketHash?.trim() || null;

    if (!email && !cpf && !hash) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Por favor, forneça o código do ingresso, e-mail ou CPF para consulta.",
        },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.findFirst({
      where: {
        OR: [
          ...(hash ? [{ ticketHash: hash }] : []),
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
        mensagem: "Nenhum ingresso ou convidado foi encontrado com esses dados.",
      });
    }

    const statusMap: Record<string, string> = {
      ACTIVE: "confirmado",
      USED: "utilizado",
      CANCELLED: "cancelado",
    };

    return NextResponse.json({
      sucesso: true,
      mensagem: "Ingresso verificado com sucesso.",
      data: {
        id: guest.id,
        nome: guest.name,
        email: guest.email,
        ticketHash: guest.ticketHash,
        status: statusMap[guest.status] || "confirmado",
        checkedInAt: guest.checkedInAt ? guest.checkedInAt.toISOString() : null,
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
