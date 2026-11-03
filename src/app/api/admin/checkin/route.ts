import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeCpf, verifyAdminToken } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Acesso negado. Token de administrador inválido." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const hash = body.ticketHash?.trim() || body.hash?.trim() || null;
    const guestId = body.guestId?.trim() || null;
    const cpf = body.cpf ? normalizeCpf(body.cpf) : null;

    if (!hash && !guestId && !cpf) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Informe o código do ingresso, ID ou CPF para check-in." },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.findFirst({
      where: {
        OR: [
          ...(hash ? [{ ticketHash: hash }] : []),
          ...(guestId ? [{ id: guestId }] : []),
          ...(cpf ? [{ cpf }] : []),
        ],
      },
      include: {
        event: true,
      },
    });

    if (!guest) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Ingresso não encontrado no sistema." },
        { status: 404 }
      );
    }

    if (guest.status === "USED") {
      const dataFormatada = guest.checkedInAt
        ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(
            guest.checkedInAt
          )
        : "data anterior";

      return NextResponse.json(
        {
          sucesso: false,
          mensagem: `ATENÇÃO: Este ingresso JÁ FOI UTILIZADO às ${dataFormatada}. Entrada não permitida.`,
          data: {
            id: guest.id,
            nome: guest.name,
            status: "utilizado",
            checkedInAt: guest.checkedInAt,
            evento: guest.event.name,
          },
        },
        { status: 409 }
      );
    }

    if (guest.status === "CANCELLED") {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Ingresso cancelado. Entrada não autorizada.",
          data: {
            id: guest.id,
            nome: guest.name,
            status: "cancelado",
            evento: guest.event.name,
          },
        },
        { status: 409 }
      );
    }

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status: "USED",
        checkedInAt: new Date(),
      },
      include: {
        event: true,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: `CHECK-IN REALIZADO! Entrada liberada para ${updated.name}.`,
      data: {
        id: updated.id,
        nome: updated.name,
        email: updated.email,
        cpf: updated.cpf,
        ticketHash: updated.ticketHash,
        status: "utilizado",
        checkedInAt: updated.checkedInAt,
        evento: updated.event.name,
      },
    });
  } catch (error) {
    console.error("Erro no check-in:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro interno ao processar check-in." },
      { status: 500 }
    );
  }
}
