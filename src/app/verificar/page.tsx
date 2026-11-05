"use client";

import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Loader2,
  Mail,
  MapPin,
  Search,
  Ticket,
  User,
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ApiError, lookupGuest } from "@/lib/api";
import {
  formatDateTime,
  GUEST_STATUS_LABELS,
  guestStatusClass,
} from "@/lib/format";
import { formatarCPF, validarCPF } from "@/lib/validations";
import type { Guest, LookupGuestInput } from "@/types";

type LookupType = "email" | "cpf" | "name";

const LOOKUP_LABELS: Record<LookupType, string> = {
  email: "E-mail",
  cpf: "CPF",
  name: "Nome",
};

export default function VerificarPage() {
  const [tipoBusca, setTipoBusca] = useState<LookupType>("email");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState<string | null>(null);

  function changeType(next: LookupType) {
    setTipoBusca(next);
    setValor("");
    setGuest(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setGuest(null);

    const trimmed = valor.trim();
    if (!trimmed) {
      setError(`Informe seu ${LOOKUP_LABELS[tipoBusca].toLowerCase()}.`);
      return;
    }

    const payload: LookupGuestInput = {};
    if (tipoBusca === "email") {
      payload.email = trimmed.toLowerCase();
    } else if (tipoBusca === "cpf") {
      const digits = trimmed.replace(/\D/g, "");
      if (!validarCPF(digits)) {
        setError("CPF inválido. Confira os números informados.");
        return;
      }
      payload.cpf = digits;
    } else {
      payload.name = trimmed;
    }

    setLoading(true);
    try {
      const found = await lookupGuest(payload);
      setGuest(found);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(
          caught.status === 404
            ? "Nenhum convidado foi encontrado com esses dados."
            : caught.message
        );
      } else {
        setError("Não foi possível consultar o ingresso. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <Ticket className="mx-auto mb-4 h-16 w-16 text-blue-600" />
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Consultar ingresso
          </h1>
          <p className="text-muted-foreground">
            Consulte seu convite por e-mail, CPF ou nome.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do convidado</CardTitle>
            <CardDescription>
              O CPF retornado pela API é sempre exibido de forma mascarada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Como deseja consultar?
                </Label>
                <RadioGroup
                  value={tipoBusca}
                  onValueChange={(value) => changeType(value as LookupType)}
                  className="flex flex-col gap-2 sm:flex-row sm:gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="email" id="lookup-email" />
                    <Label htmlFor="lookup-email" className="font-normal">
                      E-mail
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="cpf" id="lookup-cpf" />
                    <Label htmlFor="lookup-cpf" className="font-normal">
                      CPF
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="name" id="lookup-name" />
                    <Label htmlFor="lookup-name" className="font-normal">
                      Nome
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lookup-value">
                  {tipoBusca === "email" && "E-mail"}
                  {tipoBusca === "cpf" && "CPF"}
                  {tipoBusca === "name" && "Nome completo"}
                </Label>
                <div className="relative">
                  {tipoBusca === "email" && (
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  {tipoBusca === "cpf" && (
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  {tipoBusca === "name" && (
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <Input
                    id="lookup-value"
                    type={tipoBusca === "email" ? "email" : "text"}
                    inputMode={tipoBusca === "cpf" ? "numeric" : undefined}
                    placeholder={
                      tipoBusca === "email"
                        ? "maria@example.com"
                        : tipoBusca === "cpf"
                          ? "000.000.000-00"
                          : "Maria Silva"
                    }
                    value={valor}
                    onChange={(event) =>
                      setValor(
                        tipoBusca === "cpf"
                          ? formatarCPF(event.target.value)
                          : event.target.value
                      )
                    }
                    className="pl-9"
                    maxLength={tipoBusca === "cpf" ? 14 : undefined}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Consultar ingresso
                  </>
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {guest && (
              <div className="mt-6 space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-300">
                    Convite encontrado para {guest.name}.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3">
                      <span className="text-lg">{guest.event.name}</span>
                      <Badge className={guestStatusClass(guest.status)}>
                        {GUEST_STATUS_LABELS[guest.status]}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-muted-foreground">Nome</p>
                      <p>{guest.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">E-mail</p>
                      <p className="break-all">{guest.email}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">CPF</p>
                      <p>{guest.cpf ?? "Não informado"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Status do ingresso
                      </p>
                      <p>{GUEST_STATUS_LABELS[guest.status]}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Data e hora
                      </p>
                      <p>{formatDateTime(guest.event.startsAt)}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 font-medium text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> Local
                      </p>
                      <p>{guest.event.venue}</p>
                    </div>
                    {guest.checkedInAt && (
                      <div className="sm:col-span-2">
                        <p className="font-medium text-muted-foreground">
                          Check-in realizado em
                        </p>
                        <p>{formatDateTime(guest.checkedInAt)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          O código do ingresso não é exibido nesta página por segurança. Use o
          código recebido na confirmação da inscrição.
        </p>
      </div>
    </div>
  );
}
