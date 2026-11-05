"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  Search,
  Ticket,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ApiError,
  adminGuestStats,
  cancelGuest,
  checkInGuest,
  listAdminEvents,
  listAdminGuests,
} from "@/lib/api";
import {
  formatDateTime,
  GUEST_STATUS_LABELS,
} from "@/lib/format";
import type {
  Event,
  Guest,
  GuestStats,
  GuestStatus,
  Pagination,
} from "@/types";
import {
  GuestStatusBadge,
  InlineError,
  InlineSuccess,
  PanelLoading,
  PaginationControls,
} from "@/components/admin/admin-ui";

interface GuestsPanelProps {
  onUnauthorized: () => void;
}

export function GuestsPanel({ onUnauthorized }: GuestsPanelProps) {
  const [eventOptions, setEventOptions] = useState<Event[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<GuestStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuestStatus | "">("");
  const [eventFilter, setEventFilter] = useState("");

  const handleError = useCallback(
    (caught: unknown, fallback: string) => {
      if (caught instanceof ApiError && caught.status === 401) {
        onUnauthorized();
        return;
      }
      setError(caught instanceof ApiError ? caught.message : fallback);
    },
    [onUnauthorized]
  );

  useEffect(() => {
    let active = true;
    listAdminEvents({ page: 1, limit: 100 })
      .then((result) => {
        if (active) setEventOptions(result.data);
      })
      .catch((caught) => {
        if (active) handleError(caught, "Não foi possível carregar os eventos.");
      });
    return () => {
      active = false;
    };
  }, [handleError]);

  const fetchGuests = useCallback(async () => {
    try {
      const result = await listAdminGuests({
        page,
        limit: 20,
        eventId: eventFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setGuests(result.data);
      setPagination(result.pagination);
      setError(null);
    } catch (caught) {
      handleError(caught, "Não foi possível carregar os convidados.");
    } finally {
      setLoading(false);
    }
  }, [page, eventFilter, statusFilter, search, handleError]);

  const fetchStats = useCallback(async () => {
    try {
      setStats(await adminGuestStats(eventFilter || undefined));
    } catch (caught) {
      handleError(caught, "Não foi possível carregar as estatísticas.");
    }
  }, [eventFilter, handleError]);

  function refreshAll() {
    setLoading(true);
    setError(null);
    return Promise.all([fetchGuests(), fetchStats()]);
  }

  function changePage(nextPage: number) {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca ao montar/trocar filtros
    void fetchGuests();
  }, [fetchGuests]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- estatísticas ao trocar o evento
    void fetchStats();
  }, [fetchStats]);

  async function handleCheckIn(guest: Guest) {
    const confirmed = window.confirm(
      `Confirmar check-in de ${guest.name}? O ingresso será marcado como utilizado.`
    );
    if (!confirmed) return;

    setActionId(guest.id);
    setError(null);
    setMessage(null);
    try {
      await checkInGuest(guest.id);
      setMessage(`Check-in realizado para ${guest.name}.`);
      await refreshAll();
    } catch (caught) {
      handleError(caught, "Não foi possível realizar o check-in.");
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(guest: Guest) {
    const confirmed = window.confirm(
      `Cancelar o ingresso de ${guest.name}? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setActionId(guest.id);
    setError(null);
    setMessage(null);
    try {
      await cancelGuest(guest.id);
      setMessage(`Ingresso de ${guest.name} cancelado.`);
      await refreshAll();
    } catch (caught) {
      handleError(caught, "Não foi possível cancelar o ingresso.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Convidados</h2>
        <p className="text-sm text-muted-foreground">
          Consulte inscritos e realize check-in ou cancelamento.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Ticket className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
              <p className="text-xs text-muted-foreground">Utilizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="mx-auto mb-1 h-5 w-5 text-red-600" />
              <p className="text-2xl font-bold text-red-600">
                {stats.cancelled}
              </p>
              <p className="text-xs text-muted-foreground">Cancelados</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Combine evento, status e busca textual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setLoading(true);
              setError(null);
              setPage(1);
              setSearch(searchInput.trim());
            }}
            className="grid grid-cols-1 gap-3 md:grid-cols-4"
          >
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por nome, e-mail, CPF ou código"
                className="pl-9"
              />
            </div>

            <select
              value={eventFilter}
              onChange={(event) => {
                setLoading(true);
                setError(null);
                setPage(1);
                setEventFilter(event.target.value);
              }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">Todos os eventos</option>
              {eventOptions.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setLoading(true);
                setError(null);
                setPage(1);
                setStatusFilter(event.target.value as GuestStatus | "");
              }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">Todos os status</option>
              {(Object.keys(GUEST_STATUS_LABELS) as GuestStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {GUEST_STATUS_LABELS[status]}
                  </option>
                )
              )}
            </select>

            <div className="flex gap-2 md:col-span-4">
              <Button type="submit" variant="secondary">
                Buscar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refreshAll()}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && <InlineError message={error} />}
      {message && <InlineSuccess message={message} />}

      <Card>
        <CardContent className="pt-6">
          {loading && guests.length === 0 ? (
            <PanelLoading label="Carregando convidados..." />
          ) : guests.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Nenhum convidado encontrado com os filtros atuais.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Convidado</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="whitespace-normal">
                      <span className="block font-medium">{guest.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {guest.email}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      {guest.cpf ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <span className="block">{guest.event.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(guest.event.startsAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <GuestStatusBadge status={guest.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {guest.checkedInAt
                        ? formatDateTime(guest.checkedInAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {guest.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            onClick={() => void handleCheckIn(guest)}
                            disabled={actionId === guest.id}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Check-in
                          </Button>
                        )}
                        {guest.status !== "CANCELLED" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => void handleCancel(guest)}
                            disabled={actionId === guest.id}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4">
            <PaginationControls
              pagination={pagination}
              onPageChange={changePage}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
