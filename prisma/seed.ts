import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initialEvents = [
  {
    slug: "boreal-fest-2026",
    name: "Boreal Fest 2026",
    description:
      "Uma noite inesquecível com os melhores DJs do cenário eletrônico nacional e internacional. Produção espetacular, som de alta qualidade e uma experiência imersiva.",
    imageUrl: "/events/boreal.jpg",
    startsAt: new Date("2026-12-12T23:00:00.000Z"),
    venue: "Arena Music Hall - São Paulo",
    priceInCents: 20000,
    totalTickets: 500,
    termsOfUse:
      "Ao comprar você concorda com nossos termos de entrada. Proibido menores de 18 anos. Documento obrigatório.",
    status: "ACTIVE" as const,
  },
  {
    slug: "rock-nacional-2027",
    name: "Rock Nacional 2027",
    description:
      "As maiores bandas do rock nacional em uma noite histórica. Line-up completo, praça de alimentação e estacionamento no local.",
    imageUrl: null,
    startsAt: new Date("2027-01-23T22:00:00.000Z"),
    venue: "Espaço Unimed - São Paulo",
    priceInCents: 8000,
    totalTickets: 300,
    termsOfUse:
      "Evento sujeito a classificação etária de 16 anos. Menores devem estar acompanhados de responsável legal.",
    status: "ACTIVE" as const,
  },
  {
    slug: "sunset-sessions-2027",
    name: "Sunset Sessions 2027",
    description:
      "Festival de música eletrônica ao ar livre com vista para o pôr do sol. Estrutura completa, food trucks e área VIP.",
    imageUrl: null,
    startsAt: new Date("2027-02-20T18:00:00.000Z"),
    venue: "Mirante do Alto - Rio de Janeiro",
    priceInCents: 15000,
    totalTickets: 800,
    termsOfUse:
      "O evento acontece chuva ou sol. Não é permitida a entrada com bebidas ou objetos cortantes.",
    status: "ACTIVE" as const,
  },
];

async function main() {
  console.log("Iniciando seed no Prisma Postgres...");
  for (const event of initialEvents) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    });
  }
  const count = await prisma.event.count();
  console.log(`[seed] Sucesso! ${count} eventos salvos no banco de dados.`);
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
