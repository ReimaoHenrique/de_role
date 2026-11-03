import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateTicketHash,
  isValidCpf,
  normalizeCpf,
  toLegacyEvent,
} from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        startsAt: "asc",
      },
    });

    return NextResponse.json({
      sucesso: true,
      data: events.map(toLegacyEvent),
    });
  } catch (error) {
    console.error("Erro ao buscar eventos do banco:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro ao buscar eventos no banco de dados." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const nome = body.nome?.trim();
    const email = body.email?.trim().toLowerCase();
    let eventoId = body.eventoId?.trim();
    let cpf = body.cpf ? normalizeCpf(body.cpf) : null;

    if (!nome || !email) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Nome e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    if (cpf && !isValidCpf(cpf)) {
      return NextResponse.json(
        { sucesso: false, mensagem: "CPF informado é inválido." },
        { status: 422 }
      );
    }

    // Se eventoId não foi passado, seleciona o primeiro evento ativo
    if (!eventoId) {
      const firstActive = await prisma.event.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { startsAt: "asc" },
      });
      if (!firstActive) {
        return NextResponse.json(
          { sucesso: false, mensagem: "Nenhum evento ativo disponível para inscrição." },
          { status: 409 }
        );
      }
      eventoId = firstActive.id;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventoId },
    });

    if (!event) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Evento não encontrado." },
        { status: 404 }
      );
    }

    if (event.status !== "ACTIVE" || event.issuedTickets >= event.totalTickets) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Ingressos esgotados ou evento encerrado." },
        { status: 409 }
      );
    }

    // Verificar se já existe inscrição para este email ou cpf neste evento
    const existing = await prisma.guest.findFirst({
      where: {
        eventId: event.id,
        OR: [
          { email },
          ...(cpf ? [{ cpf }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Já existe um ingresso cadastrado para este e-mail ou CPF neste evento.",
        },
        { status: 409 }
      );
    }

    const ticketHash = generateTicketHash(32);

    const [guest] = await prisma.$transaction([
      prisma.guest.create({
        data: {
          eventId: event.id,
          eventName: event.name,
          eventStartsAt: event.startsAt,
          eventVenue: event.venue,
          name: nome,
          email,
          cpf,
          ticketHash,
          status: "ACTIVE",
        },
      }),
      prisma.event.update({
        where: { id: event.id },
        data: {
          issuedTickets: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json(
      {
        sucesso: true,
        data: {
          id: guest.id,
          hash: guest.ticketHash,
          ticketHash: guest.ticketHash,
          eventoId: guest.eventId,
          status: "confirmado",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao emitir ingresso:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro ao processar inscrição. Tente novamente." },
      { status: 500 }
    );
  }
}
