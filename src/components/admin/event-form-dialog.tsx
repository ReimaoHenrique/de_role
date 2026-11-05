"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ApiError,
  createAdminEvent,
  updateAdminEvent,
} from "@/lib/api";
import {
  EVENT_STATUS_LABELS,
  fromDateTimeInputValue,
  toDateTimeInputValue,
} from "@/lib/format";
import type {
  CreateEventInput,
  Event,
  EventStatus,
} from "@/types";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onSaved: (event: Event) => void;
}

interface FormState {
  name: string;
  description: string;
  imageUrl: string;
  startsAt: string;
  venue: string;
  price: string;
  totalTickets: string;
  termsOfUse: string;
  status: EventStatus;
}

function initialState(event: Event | null): FormState {
  if (!event) {
    return {
      name: "",
      description: "",
      imageUrl: "",
      startsAt: "",
      venue: "",
      price: "",
      totalTickets: "100",
      termsOfUse: "Entrada permitida mediante apresentação de documento com foto.",
      status: "ACTIVE",
    };
  }

  return {
    name: event.name,
    description: event.description,
    imageUrl: event.imageUrl ?? "",
    startsAt: toDateTimeInputValue(event.startsAt),
    venue: event.venue,
    price: (event.priceInCents / 100).toFixed(2),
    totalTickets: String(event.totalTickets),
    termsOfUse: event.termsOfUse,
    status: event.status,
  };
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  onSaved,
}: EventFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? "Editar evento" : "Cadastrar novo evento"}
          </DialogTitle>
          <DialogDescription>
            Os campos abaixo seguem o contrato canônico do gateway.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EventFormBody
            event={event}
            onSaved={onSaved}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EventFormBody({
  event,
  onSaved,
  onCancel,
}: {
  event: Event | null;
  onSaved: (event: Event) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => initialState(event));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    setError(null);

    if (form.name.trim().length < 3) {
      setError("O nome do evento precisa ter pelo menos 3 caracteres.");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("A descrição precisa ter pelo menos 10 caracteres.");
      return;
    }
    if (form.venue.trim().length < 3) {
      setError("Informe o local do evento.");
      return;
    }
    if (!form.startsAt) {
      setError("Informe a data e a hora do evento.");
      return;
    }

    const price = Number(form.price.replace(",", "."));
    if (!Number.isFinite(price) || price < 0) {
      setError("Informe um preço válido em reais.");
      return;
    }

    const totalTickets = Number.parseInt(form.totalTickets, 10);
    if (!Number.isFinite(totalTickets) || totalTickets < 1) {
      setError("O total de ingressos deve ser maior que zero.");
      return;
    }

    const payload: CreateEventInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || null,
      startsAt: fromDateTimeInputValue(form.startsAt),
      venue: form.venue.trim(),
      priceInCents: Math.round(price * 100),
      totalTickets,
      termsOfUse: form.termsOfUse.trim(),
      status: form.status,
    };

    setLoading(true);
    try {
      const saved = event
        ? await updateAdminEvent(event.id, payload)
        : await createAdminEvent(payload);
      onSaved(saved);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Não foi possível salvar o evento. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="event-name">Nome</Label>
          <Input
            id="event-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-venue">Local</Label>
          <Input
            id="event-venue"
            value={form.venue}
            onChange={(event) => update("venue", event.target.value)}
            maxLength={255}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-starts">Data e hora (Brasília)</Label>
          <Input
            id="event-starts"
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => update("startsAt", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-price">Preço (R$)</Label>
          <Input
            id="event-price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => update("price", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-tickets">Total de ingressos</Label>
          <Input
            id="event-tickets"
            type="number"
            min="1"
            step="1"
            value={form.totalTickets}
            onChange={(event) => update("totalTickets", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-status">Status</Label>
          <select
            id="event-status"
            value={form.status}
            onChange={(event) =>
              update("status", event.target.value as EventStatus)
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {(Object.keys(EVENT_STATUS_LABELS) as EventStatus[]).map(
              (status) => (
                <option key={status} value={status}>
                  {EVENT_STATUS_LABELS[status]}
                </option>
              )
            )}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-image">Caminho da imagem</Label>
          <Input
            id="event-image"
            placeholder="/events/meu-evento.jpg"
            value={form.imageUrl}
            onChange={(event) => update("imageUrl", event.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            Caminho relativo dentro de public/. Deixe vazio para usar o
            placeholder.
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="event-description">Descrição</Label>
          <textarea
            id="event-description"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            rows={4}
            maxLength={5000}
            required
            className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="event-terms">Termos de uso</Label>
          <textarea
            id="event-terms"
            value={form.termsOfUse}
            onChange={(event) => update("termsOfUse", event.target.value)}
            rows={3}
            maxLength={5000}
            required
            className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : event ? (
            "Salvar alterações"
          ) : (
            "Cadastrar evento"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
