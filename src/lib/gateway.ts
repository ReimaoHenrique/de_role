import type { ApiMeta } from "@/types";

const FALLBACK_GATEWAY_URL = "http://localhost:4000";

/**
 * URL do gateway usada somente no servidor (route handlers e server
 * components). O browser nunca recebe esta variável.
 */
export const GATEWAY_URL = (
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  FALLBACK_GATEWAY_URL
).replace(/\/+$/, "");

interface GatewayEnvelope<T> {
  success?: boolean;
  data?: T;
  meta?: ApiMeta;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export interface GatewayResult<T> {
  data: T;
  meta?: ApiMeta;
  status: number;
}

export class GatewayError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "GatewayError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function gatewayRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<GatewayResult<T>> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${GATEWAY_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new GatewayError(
      502,
      "GATEWAY_UNAVAILABLE",
      "Não foi possível conectar ao serviço de eventos. Tente novamente em instantes."
    );
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const envelope: GatewayEnvelope<T> = isObject(payload)
    ? (payload as GatewayEnvelope<T>)
    : {};

  if (!response.ok || envelope.success !== true) {
    const code =
      typeof envelope.error?.code === "string"
        ? envelope.error.code
        : "GATEWAY_ERROR";
    const message =
      typeof envelope.error?.message === "string"
        ? envelope.error.message
        : "Não foi possível concluir a solicitação.";

    throw new GatewayError(
      response.status || 502,
      code,
      message,
      envelope.error?.details
    );
  }

  return {
    data: envelope.data as T,
    meta: envelope.meta,
    status: response.status,
  };
}
