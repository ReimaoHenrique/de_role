import { Evento } from "@/types";

export interface EventoAPI {
  id: string;
  nome: string;
  descricao: string;
  imagem: string | null;
  data: string;
  local: string;
  preco: number;
  ingressosDisponiveis: number;
  ingressosTotal: number;
  linkPagamento: string;
  termosUso: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventosResponse {
  sucesso: boolean;
  data: EventoAPI[];
}

export async function buscarEventos(): Promise<Evento[]> {
  try {
    const response = await fetch("/api/eventos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: EventosResponse = await response.json();

    if (!data.sucesso) {
      throw new Error("Erro ao buscar eventos");
    }

    // Converter os dados da API para o formato interno
    return data.data.map(
      (eventoAPI): Evento => ({
        id: eventoAPI.id,
        nome: eventoAPI.nome,
        descricao: eventoAPI.descricao,
        imagem:
          eventoAPI.imagem &&
          eventoAPI.imagem !== "https://exemplo.com/imagem.jpg"
            ? eventoAPI.imagem
            : "/events/boreal.jpg", // Fallback para imagem padrão
        data: eventoAPI.data,
        local: eventoAPI.local,
        preco: eventoAPI.preco,
        ingressosDisponiveis: eventoAPI.ingressosDisponiveis,
        ingressosTotal: eventoAPI.ingressosTotal,
        termosUsoTitle: eventoAPI.termosUso,
      })
    );
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error;
  }
}

export async function buscarEventoPorId(id: string): Promise<Evento | null> {
  try {
    const response = await fetch(`/api/eventos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    if (!data.sucesso) {
      throw new Error("Erro ao buscar evento");
    }

    const eventoAPI: EventoAPI = data.data;

    // Converter para o formato interno
    return {
      id: eventoAPI.id,
      nome: eventoAPI.nome,
      descricao: eventoAPI.descricao,
      imagem:
        eventoAPI.imagem &&
        eventoAPI.imagem !== "https://exemplo.com/imagem.jpg"
          ? eventoAPI.imagem
          : "/events/boreal.jpg",
      data: eventoAPI.data,
      local: eventoAPI.local,
      preco: eventoAPI.preco,
      ingressosDisponiveis: eventoAPI.ingressosDisponiveis,
      ingressosTotal: eventoAPI.ingressosTotal,
      termosUsoTitle: eventoAPI.termosUso,
    };
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    throw error;
  }
}
