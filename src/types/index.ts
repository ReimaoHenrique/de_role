export interface Evento {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
  data: string;
  local: string;
  preco: number;
  ingressosDisponiveis: number;
  ingressosTotal: number;
  termosUsoTitle: string;
}

export interface Ingresso {
  id: string;
  eventoId: string;
  cpf: string;
  nome: string;
  email: string;
  hash: string;
  dataCompra: string;
  status: "ativo" | "usado" | "cancelado";
}

// Tipo para a estrutura real da API externa
export interface IngressoExterno {
  id: string;
  eventoId: string;
  nomeEvento: string;
  cpf: string | null;
  nome: string;
  email: string;
  hash: string;
  dataCompra: string;
  status: "ativo" | "usado" | "cancelado";
  createdAt: string;
  updatedAt: string;
  evento: {
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
  };
}

// Tipo para a resposta da API externa
export interface ApiExternaResponse {
  sucesso: boolean;
  data: IngressoExterno[];
}

export interface Festa {
  id: string;
  nome: string;
  quantidadeTotal: number;
  quantidadeVendidos: number;
  valorUnitario: number;
  lucroTotal: number;
  lucroAtual: number;
  data: string;
  status: "ativa" | "finalizada" | "cancelada";
}

export interface VerificarIngressoRequest {
  cpf?: string; // Opcional
  nome?: string; // Opcional
}

export interface VerificarIngressoResponse {
  sucesso: boolean;
  mensagem: string;
  ingresso?: Ingresso;
  hash?: string;
}

export interface AdminLoginRequest {
  hash: string;
}

export interface AdminLoginResponse {
  sucesso: boolean;
  token?: string;
  mensagem: string;
}

// Novos tipos para a API de verificação de convidados
export interface VerificarConvidadoRequest {
  email?: string;
  cpf?: string;
}

export interface EventoConvidado {
  nome: string;
  data: string;
  local: string;
}

export interface VerificarConvidadoResponse {
  sucesso: boolean;
  mensagem: string;
  data?: {
    status: string;
    evento: EventoConvidado;
  };
}
