// Tipos compartilhados entre frontend e backend

// ---------------------------------------------------------------------------
// Eventos / ingressos
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Festa (formato legado usado no dashboard administrativo)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Verificação de ingresso
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Verificação de convidado
// ---------------------------------------------------------------------------

/**
 * Payload para verificar um convidado.
 * Pelo menos um dos campos deve ser fornecido.
 */
export interface VerificarConvidadoRequest {
  email?: string;
  cpf?: string;
  hash?: string;
}

export interface EventoConvidado {
  nome: string;
  data: string;
  local: string;
}

/**
 * Resposta de /api/verificar-convidado.
 */
export interface VerificarConvidadoResponse {
  sucesso: boolean;
  mensagem: string;
  data?: {
    id?: string;
    nome?: string;
    email?: string;
    ticketHash?: string;
    status: string;
    checkedInAt?: string | null;
    evento: EventoConvidado;
  };
}

// ---------------------------------------------------------------------------
// Login / autenticação administrativa
// ---------------------------------------------------------------------------

export interface AdminLoginRequest {
  hash: string;
}

export interface AdminLoginResponse {
  sucesso: boolean;
  token?: string;
  mensagem: string;
}

export interface UseAdminAuthReturn {
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

// ---------------------------------------------------------------------------
// Check-in (admin)
// ---------------------------------------------------------------------------

export interface AdminCheckinRequest {
  hash?: string;
  cpf?: string;
}

export interface AdminCheckinResponse {
  sucesso: boolean;
  mensagem: string;
  data?: {
    nome: string;
    email: string;
    cpf: string;
    evento: string;
    checkinAt: string;
  };
}

// ---------------------------------------------------------------------------
// Eventos (admin)
// ---------------------------------------------------------------------------

export interface AdminEventoRequest {
  nome: string;
  descricao: string;
  local: string;
  data: string; // ISO date string
  preco: number;
  quantidadeTotal: number;
  termosUso?: string;
  imagemUrl?: string;
}

export interface AdminEventoResponse {
  sucesso: boolean;
  mensagem: string;
  data?: any; // could be the created event
}

// ---------------------------------------------------------------------------
// Convidados (admin)
// ---------------------------------------------------------------------------

export interface AdminConvidado {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  status: string;
  evento: string;
  dataCompra: string;
  checkinAt?: string;
}

export interface AdminConvidadosResponse {
  sucesso: boolean;
  mensagem?: string;
  data?: AdminConvidado[];
}
