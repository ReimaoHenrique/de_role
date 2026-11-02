"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, MapPin, Users, Info, Loader2 } from "lucide-react";
import { eventoMock } from "@/lib/mock-data";
import { Accordion } from "@/components/ui/accordion";
import { TicketForm } from "@/components/TicketForm";
import { useEventos } from "@/lib/hooks/useEventos";

export default function Home() {
  const { eventos, loading, error } = useEventos();
  const [imageError, setImageError] = useState(false);

  // Usar o primeiro evento disponível ou fallback para mock
  const evento = eventos.length > 0 ? eventos[0] : eventoMock;

  // Cálculos
  const ingressosVendidos = evento.ingressosTotal - evento.ingressosDisponiveis;
  const percentualVendido = (ingressosVendidos / evento.ingressosTotal) * 100;

  // Formatações
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando eventos...</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error && eventos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          {/* Imagem do evento */}
          <div className="relative h-64 md:h-80">
            {!imageError && evento.imagem ? (
              <Image
                src={evento.imagem}
                alt={evento.nome}
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500">Imagem não disponível</span>
              </div>
            )}

            {/* Overlay com informações */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {evento.nome}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(evento.data)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{evento.local}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do evento */}
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Informações do Evento</span>
              <Badge
                variant={
                  evento.ingressosDisponiveis > 0 ? "default" : "destructive"
                }
              >
                {evento.ingressosDisponiveis > 0 ? "Disponível" : "Esgotado"}
              </Badge>
            </CardTitle>
            <p className="text-base leading-relaxed text-muted-foreground">
              {evento.descricao}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {evento.ingressosDisponiveis}
                </div>
                <div className="text-sm text-gray-600">
                  Ingressos Disponíveis
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(evento.preco)}
                </div>
                <div className="text-sm text-gray-600">Preço por Ingresso</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {percentualVendido.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Vendidos</div>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Vendidos: {ingressosVendidos}</span>
                <span>Total: {evento.ingressosTotal}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentualVendido}%` }}
                ></div>
              </div>
            </div>

            {/* Termos de uso */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{evento.termosUsoTitle}</AlertDescription>
            </Alert>
            <Accordion type="single" collapsible>
              <TicketForm preco={evento.preco} eventoId={evento.id} />
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
