import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { toLegacyEvent, verifyAdminToken } from "@/lib/server-utils";

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
    const name = body.name?.trim() || body.nome?.trim();
    const description = body.description?.trim() || body.descricao?.trim() || "";
    const venue = body.venue?.trim() || body.local?.trim();
    const startsAtRaw = body.startsAt || body.data;
    const price = typeof body.price === "number" ? body.price : typeof body.preco === "number" ? body.preco : 0;
    const totalTickets = parseInt(body.totalTickets || body.quantidadeTotal, 10) || 100;
    const termsOfUse = body.termsOfUse?.trim() || body.termosUso?.trim() || "Entrada permitida mediante apresentação de documento com foto.";
    const imageUrl = body.imageUrl?.trim() || body.imagem?.trim() || null;

    if (!name || !venue || !startsAtRaw) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Nome, local e data/hora do evento são obrigatórios." },
        { status: 400 }
      );
    }

    const startsAt = new Date(startsAtRaw);
    if (Number.isNaN(startsAt.getTime())) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Data e hora inválidas." },
        { status: 400 }
      );
    }

    const baseSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const event = await prisma.event.create({
      data: {
        name,
        slug,
        description,
        venue,
        startsAt,
        priceInCents: Math.round(price * 100),
        totalTickets,
        termsOfUse,
        imageUrl,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Festa cadastrada com sucesso!",
        data: toLegacyEvent(event),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar evento:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro interno ao cadastrar nova festa." },
      { status: 500 }
    );
  }
}
