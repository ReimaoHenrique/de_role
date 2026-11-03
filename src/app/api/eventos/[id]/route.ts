import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { toLegacyEvent } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!event) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Evento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      data: toLegacyEvent(event),
    });
  } catch (error) {
    console.error("Erro ao buscar evento por ID:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro ao buscar detalhes do evento." },
      { status: 500 }
    );
  }
}
