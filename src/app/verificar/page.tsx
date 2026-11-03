"use client";

import { useState } from "react";
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
import { Search, CheckCircle, XCircle, Loader2, Ticket } from "lucide-react";
import { MESSAGES } from "@/lib/constants";
import { VerificarConvidadoRequest, VerificarConvidadoResponse } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function VerificarPage() {
  const [tipoBusca, setTipoBusca] = useState<"cpf" | "email" | "hash">("email");
  const [formData, setFormData] = useState<VerificarConvidadoRequest>({
    cpf: "",
    email: "",
    hash: "",
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<VerificarConvidadoResponse | null>(
    null
  );

  const handleInputChange = (
    field: keyof VerificarConvidadoRequest,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara do CPF
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    handleInputChange("cpf", formatted);
  };

  const verificarConvidado = async () => {
    const valor = tipoBusca === "cpf" ? formData.cpf : formData.email;

    if (!valor) {
      setResultado({
        sucesso: false,
        mensagem: `Por favor, preencha o campo ${
          tipoBusca === "cpf" ? "CPF" : "Email"
        }.`,
      });
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      // Prepara o payload para a API
      const payload: VerificarConvidadoRequest = {};

      if (tipoBusca === "email") {
        payload.email = formData.email;
      } else {
        payload.cpf = formData.cpf;
      }

      // Chama a API local que faz proxy para a API externa
      const response = await fetch("/api/verificar-convidado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const apiResponse: VerificarConvidadoResponse = await response.json();

      if (apiResponse.sucesso) {
        setResultado(apiResponse);
      } else {
        setResultado({
          sucesso: false,
          mensagem: apiResponse.mensagem || MESSAGES.CONVIDADO_NAO_ENCONTRADO,
        });
      }
    } catch (error) {
      console.error("Erro ao verificar convidado:", error);
      setResultado({
        sucesso: false,
        mensagem:
          "Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verificarConvidado();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmado":
        return (
          <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
        );
      case "cancelado":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Ticket className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Verificar Convite
          </h1>
          <p className="text-muted-foreground">
            Digite seu CPF ou email para verificar o status do seu convite.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consultar Convite</CardTitle>
            <CardDescription>
              Escolha como deseja verificar seu convite e preencha o campo
              correspondente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção do tipo de busca */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Como você deseja verificar?
                </Label>
                <RadioGroup
                  value={tipoBusca}
                  onValueChange={(value) =>
                    setTipoBusca(value as "cpf" | "email")
                  }
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-option" />
                    <Label
                      htmlFor="email-option"
                      className="text-sm font-normal"
                    >
                      Verificar por Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cpf" id="cpf-option" />
                    <Label htmlFor="cpf-option" className="text-sm font-normal">
                      Verificar por CPF
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Campo de entrada */}
              <div className="space-y-2">
                {tipoBusca === "email" ? (
                  <>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      maxLength={14}
                    />
                  </>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  loading ||
                  !(tipoBusca === "cpf" ? formData.cpf : formData.email)
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Verificar Convite
                  </>
                )}
              </Button>
            </form>

            {/* Resultado da Verificação */}
            {resultado && (
              <div className="mt-6">
                <Alert
                  className={
                    resultado.sucesso
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }
                >
                  {resultado.sucesso ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      resultado.sucesso ? "text-green-800" : "text-red-800"
                    }
                  >
                    {resultado.mensagem}
                  </AlertDescription>
                </Alert>

                {/* Detalhes do Evento */}
                {resultado.sucesso && resultado.data && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Detalhes do Evento</span>
                        {getStatusBadge(resultado.data.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Nome do Evento
                          </Label>
                          <p className="text-sm font-medium">
                            {resultado.data.evento.nome}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Local
                          </Label>
                          <p className="text-sm font-medium">
                            {resultado.data.evento.local}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium text-gray-500">
                            Data e Hora
                          </Label>
                          <p className="text-sm font-medium">
                            {formatDate(resultado.data.evento.data)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Não encontrou seu convite? Entre em contato conosco.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm">
              Suporte via WhatsApp
            </Button>
            <Button variant="outline" size="sm">
              Enviar Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
