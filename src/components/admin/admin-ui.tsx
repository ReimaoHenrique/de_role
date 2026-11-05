"use client";

import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  EVENT_STATUS_LABELS,
  eventStatusClass,
  GUEST_STATUS_LABELS,
  guestStatusClass,
} from "@/lib/format";
import type { EventStatus, GuestStatus, Pagination } from "@/types";

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge className={eventStatusClass(status)}>
      {EVENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function GuestStatusBadge({ status }: { status: GuestStatus }) {
  return (
    <Badge className={guestStatusClass(status)}>
      {GUEST_STATUS_LABELS[status]}
    </Badge>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function InlineSuccess({ message }: { message: string }) {
  return (
    <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
      <AlertDescription className="text-green-800 dark:text-green-300">
        {message}
      </AlertDescription>
    </Alert>
  );
}

export function PanelLoading({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function PaginationControls({
  pagination,
  onPageChange,
  disabled = false,
}: {
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !pagination.hasPrev}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {pagination.page} de {pagination.totalPages} · {pagination.total}{" "}
        registro(s)
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !pagination.hasNext}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
