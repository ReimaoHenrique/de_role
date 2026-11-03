// Types shared across the frontend

/**
 * Request payload for verifying a guest.
 * At least one of the fields must be provided.
 */
export interface VerificarConvidadoRequest {
  email?: string;
  cpf?: string;
  hash?: string;
}

/**
 * Response returned by /api/verificar-convidado.
 */
export interface VerificarConvidadoResponse {
  sucesso: boolean;
  mensagem: string;
  data?: {
    evento: {
      nome: string;
      local: string;
      data: string; // ISO date string
    };
    status: string;
    ticketHash?: string;
  };
}

/**
 * Admin authentication hook return type.
 */
export interface UseAdminAuthReturn {
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

/**
 * Request for admin check‑in endpoint.
 */
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

/**
 * Request for creating a new event (admin).
 */
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

/**
 * Guest data returned by admin convidados endpoint.
 */
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

/**
 * Existing type for an event (Festa) used in the admin dashboard.
 */
export interface Festa {
  id: string;
  nome: string;
  descricao: string;
  local: string;
  data: string;
  status: string;
  preco: number;
  quantidadeTotal: number;
  quantidadeVendidos: number;
  lucroAtual: number;
  lucroTotal: number;
}
