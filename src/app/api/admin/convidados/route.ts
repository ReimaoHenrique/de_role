import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Acesso negado. Token de administrador inválido." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 300);

    const where: Record<string, unknown> = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status && ["ACTIVE", "USED", "CANCELLED"].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search } },
        { ticketHash: { contains: search, mode: "insensitive" } },
      ];
    }

    const guests = await prisma.guest.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startsAt: true,
            venue: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const statusMap: Record<string, string> = {
      ACTIVE: "confirmado",
      USED: "utilizado",
      CANCELLED: "cancelado",
    };

    return NextResponse.json({
      sucesso: true,
      data: guests.map((g) => ({
        id: g.id,
        nome: g.name,
        email: g.email,
        cpf: g.cpf,
        ticketHash: g.ticketHash,
        status: statusMap[g.status] || "confirmado",
        rawStatus: g.status,
        checkedInAt: g.checkedInAt ? g.checkedInAt.toISOString() : null,
        createdAt: g.createdAt.toISOString(),
        evento: {
          id: g.event.id,
          nome: g.event.name,
          data: g.event.startsAt.toISOString(),
          local: g.event.venue,
        },
      })),
    });
  } catch (error) {
    console.error("Erro ao listar convidados:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro interno ao consultar lista de convidados." },
      { status: 500 }
    );
  }
}
