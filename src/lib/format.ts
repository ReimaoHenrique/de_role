import type { EventStatus, GuestStatus } from "@/types";

const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

export function formatCurrencyFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((Number.isFinite(cents) ? cents : 0) / 100);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Data inválida";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: SAO_PAULO_TIME_ZONE,
  }).format(date);
}

export function formatDateOnly(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Data inválida";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: SAO_PAULO_TIME_ZONE,
  }).format(date);
}

/** Converte um ISO UTC para o valor de um input datetime-local em São Paulo. */
export function toDateTimeInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: SAO_PAULO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return parts.replace(" ", "T");
}

/** Interpreta o valor do input como horário de Brasília e devolve ISO UTC. */
export function fromDateTimeInputValue(value: string): string {
  return new Date(`${value}:00-03:00`).toISOString();
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  SOLD_OUT: "Esgotado",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

export const GUEST_STATUS_LABELS: Record<GuestStatus, string> = {
  ACTIVE: "Confirmado",
  USED: "Utilizado",
  CANCELLED: "Cancelado",
};

export function eventStatusClass(status: EventStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "SOLD_OUT":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    case "FINISHED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    case "DRAFT":
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function guestStatusClass(status: GuestStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "USED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function occupancyPercentage(issued: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((issued / total) * 100));
}
