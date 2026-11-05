"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  Ticket,
  Users,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, adminDashboard } from "@/lib/api";
import {
  formatCurrencyFromCents,
  formatDateTime,
} from "@/lib/format";
import type { DashboardData } from "@/types";
import {
  EventStatusBadge,
  InlineError,
  PanelLoading,
} from "@/components/admin/admin-ui";

interface DashboardPanelProps {
  onUnauthorized: () => void;
}

export function DashboardPanel({ onUnauthorized }: DashboardPanelProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setData(await adminDashboard());
      setError(null);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        onUnauthorized();
        return;
      }
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Não foi possível carregar o dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  function refresh() {
    setLoading(true);
    setError(null);
    void fetchDashboard();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carregamento inicial via API
    void fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !data) return <PanelLoading label="Carregando dashboard..." />;

  if (error && !data) {
    return (
      <div className="space-y-4">
        <InlineError message={error} />
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { totals } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visão geral</h2>
          <p className="text-sm text-muted-foreground">
            Receita, ocupação e convidados de todos os eventos.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {error && <InlineError message={error} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrencyFromCents(totals.revenueInCents)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Ingressos emitidos
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {totals.issuedTickets}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / {totals.totalTickets}
                  </span>
                </p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ocupação</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totals.occupancyRate.toFixed(1)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eventos ativos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totals.activeEvents}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / {totals.events}
                  </span>
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totals.guests.total}</p>
            <p className="text-xs text-muted-foreground">Convidados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              {totals.guests.active}
            </p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totals.guests.used}
            </p>
            <p className="text-xs text-muted-foreground">Check-in realizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="flex items-center justify-center gap-1 text-2xl font-bold text-red-600">
              <XCircle className="h-5 w-5" />
              {totals.guests.cancelled}
            </p>
            <p className="text-xs text-muted-foreground">Cancelados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
          <CardDescription>
            Ocupação e receita por evento, ordenados pelo início.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.events.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum evento cadastrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Emitidos</TableHead>
                  <TableHead className="text-right">Ocupação</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{formatDateTime(event.startsAt)}</TableCell>
                    <TableCell>
                      <EventStatusBadge status={event.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {event.issuedTickets} / {event.totalTickets}
                    </TableCell>
                    <TableCell className="text-right">
                      {event.occupancyRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrencyFromCents(event.revenueInCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
