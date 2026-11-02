// URLs da API (proxy interno do Next -> API Gateway)
export const API_ENDPOINTS = {
  EVENTOS: "/api/eventos",
  ADMIN_FESTAS: "/api/admin/festas",
  VERIFICAR_CONVIDADO: "/api/verificar-convidado",
} as const;

// Mensagens padrão
export const MESSAGES = {
  INGRESSO_ENCONTRADO: "Ingresso ativo. Hash:",
  INGRESSO_NAO_ENCONTRADO: "Nenhum ingresso encontrado.",
  LOGIN_INVALIDO: "Hash de acesso inválido.",
  LOGIN_SUCESSO: "Login realizado com sucesso.",
  ERRO_SERVIDOR: "Erro interno do servidor. Tente novamente.",
  CONVIDADO_NAO_ENCONTRADO: "Convidado não encontrado.",
} as const;
