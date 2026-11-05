"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Loader2, Ticket } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiError, createGuest } from "@/lib/api";
import { formatarCPF, validarCPF } from "@/lib/validations";
import { formatDateTime } from "@/lib/format";
import type { Event, Guest } from "@/types";

interface TicketFormValues {
  fullName: string;
  email: string;
  cpf: string;
  terms: boolean;
}

interface TicketFormProps {
  event: Event;
  disabled?: boolean;
}

export function TicketForm({ event, disabled = false }: TicketFormProps) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<TicketFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      cpf: "",
      terms: false,
    },
  });

  async function onSubmit(data: TicketFormValues) {
    setError(null);

    if (!data.terms) {
      setError("Você deve aceitar os termos de uso para continuar.");
      return;
    }

    const cpfDigits = data.cpf.replace(/\D/g, "");
    if (cpfDigits && !validarCPF(cpfDigits)) {
      setError("CPF inválido. Confira os números informados.");
      return;
    }

    setLoading(true);
    try {
      const created = await createGuest({
        eventId: event.id,
        name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        ...(cpfDigits ? { cpf: cpfDigits } : {}),
      });

      setGuest(created);
      form.reset();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Não foi possível confirmar sua inscrição. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyTicketHash() {
    if (!guest) return;
    try {
      await navigator.clipboard.writeText(guest.ticketHash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem acesso à área de transferência: o código continua visível na tela.
    }
  }

  if (guest) {
    return (
      <div className="space-y-5 rounded-lg border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-600 p-2 text-white">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
              Inscrição confirmada!
            </h3>
            <p className="text-sm text-green-800 dark:text-green-300">
              {guest.name}, seu ingresso para {guest.event.name} está garantido.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-4 text-center dark:bg-background sm:flex-row sm:text-left">
          <div className="rounded-lg border bg-white p-2">
            <QRCodeSVG value={guest.ticketHash} size={132} level="M" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Código do ingresso
            </p>
            <p className="break-all rounded bg-muted px-2 py-1 font-mono text-sm">
              {guest.ticketHash}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyTicketHash}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copiar código
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Apresente este QR Code ou o código na entrada do evento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-muted-foreground">Evento</p>
            <p>{guest.event.name}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Data e local</p>
            <p>
              {formatDateTime(guest.event.startsAt)} — {guest.event.venue}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">E-mail</p>
            <p>{guest.email}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">CPF</p>
            <p>{guest.cpf ?? "Não informado"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <Alert variant="destructive">
        <Ticket className="h-4 w-4" />
        <AlertTitle>Ingressos esgotados</AlertTitle>
        <AlertDescription>
          Este evento não está mais recebendo novas inscrições.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          rules={{
            required: "Nome completo é obrigatório.",
            minLength: { value: 3, message: "Informe pelo menos 3 caracteres." },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Maria Silva" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          rules={{
            required: "E-mail é obrigatório.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Informe um e-mail válido.",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="maria@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  {...field}
                  onChange={(event) =>
                    field.onChange(formatarCPF(event.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          rules={{ required: "Você deve aceitar os termos de uso." }}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 accent-blue-600"
                />
                <FormLabel htmlFor="terms" className="cursor-pointer font-normal">
                  Li e aceito os termos de uso deste evento.
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirmando...
            </>
          ) : (
            "Confirmar inscrição"
          )}
        </Button>
      </form>
    </Form>
  );
}
