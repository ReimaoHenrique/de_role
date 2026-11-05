import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EventImage } from "@/components/event-image";
import {
  EVENT_STATUS_LABELS,
  eventStatusClass,
  formatCurrencyFromCents,
  formatDateTime,
  occupancyPercentage,
} from "@/lib/format";
import { buildQuery, GatewayError, gatewayRequest } from "@/lib/gateway";
import type { Event, Pagination } from "@/types";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

function pageHref(page: number, search: string): string {
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  if (search) query.set("search", search);
  const suffix = query.toString();
  return suffix ? `/?${suffix}` : "/";
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const search = (params.search ?? "").trim();
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let events: Event[] = [];
  let pagination: Pagination | null = null;
  let error: string | null = null;

  try {
    const query = buildQuery({
      status: "ACTIVE",
      page,
      limit: 9,
      search: search || undefined,
    });
    const result = await gatewayRequest<Event[]>(`/api/events${query}`);
    events = result.data;
    pagination = result.meta?.pagination ?? null;
  } catch (caught) {
    error =
      caught instanceof GatewayError
        ? caught.message
        : "Não foi possível carregar os eventos. Tente novamente em instantes.";
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <section className="mx-auto mb-10 max-w-3xl text-center">
        <Badge className="mb-4" variant="secondary">
          <Ticket className="mr-1 h-3 w-3" />
          Ingressos disponíveis
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Encontre seu próximo evento
        </h1>
        <p className="mt-3 text-muted-foreground">
          Escolha um evento, garanta seu ingresso e apresente o código na entrada.
        </p>

        <form action="/" method="get" className="mx-auto mt-6 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="Buscar por nome, local ou descrição"
              className="pl-9"
              aria-label="Buscar eventos"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
      </section>

      {error && (
        <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!error && events.length === 0 && (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {search ? "Nenhum evento encontrado" : "Nenhum evento disponível"}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {search
                ? `Não encontramos eventos para “${search}”. Tente outro termo de busca.`
                : "Novos eventos serão publicados em breve. Volte mais tarde."}
            </p>
            {search && (
              <Button asChild variant="outline">
                <Link href="/">Limpar busca</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!error && events.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {pagination?.total ?? events.length} evento(s) encontrado(s)
            </h2>
            {pagination && pagination.totalPages > 1 && (
              <span className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const soldOut =
                event.status === "SOLD_OUT" || event.availableTickets <= 0;

              return (
                <Card
                  key={event.id}
                  className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-48">
                    <EventImage
                      src={event.imageUrl}
                      alt={event.name}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div className="absolute left-3 top-3">
                      <Badge className={eventStatusClass(event.status)}>
                        {EVENT_STATUS_LABELS[event.status]}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 text-xl">
                      {event.name}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        {formatDateTime(event.startsAt)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {event.venue}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {event.description}
                    </p>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Por pessoa
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {formatCurrencyFromCents(event.priceInCents)}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p className="flex items-center justify-end gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {event.availableTickets} restantes
                          </p>
                          <p>
                            {occupancyPercentage(
                              event.issuedTickets,
                              event.totalTickets
                            )}
                            % vendido
                          </p>
                        </div>
                      </div>

                      <Button
                        asChild
                        className="w-full"
                        variant={soldOut ? "outline" : "default"}
                      >
                        <Link href={`/eventos/${event.slug}`}>
                          {soldOut ? "Ver detalhes (esgotado)" : "Ver detalhes e garantir ingresso"}
                          {!soldOut && <ArrowRight className="h-4 w-4" />}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild variant="outline">
                <Link
                  href={pageHref(pagination.page - 1, search)}
                  aria-disabled={!pagination.hasPrev}
                  className={!pagination.hasPrev ? "pointer-events-none opacity-50" : ""}
                >
                  Anterior
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button asChild variant="outline">
                <Link
                  href={pageHref(pagination.page + 1, search)}
                  aria-disabled={!pagination.hasNext}
                  className={!pagination.hasNext ? "pointer-events-none opacity-50" : ""}
                >
                  Próxima
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
