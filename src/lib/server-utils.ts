import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import type { Festa } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_in_production";
const ADMIN_ACCESS_HASH = process.env.ADMIN_ACCESS_HASH || "d02f312c49a3e7b62daccf1f6e925b1872cf4e891ea13d26d4d52b86d1448579";

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (digits[i] ?? 0) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== digits[9]) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += (digits[i] ?? 0) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === digits[10];
}

export function generateTicketHash(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function verifyAdminHash(inputHash: string): boolean {
  const cleanInput = inputHash.trim();
  const target = ADMIN_ACCESS_HASH.trim();
  const left = createHash("sha256").update(cleanInput, "utf8").digest();
  const right = createHash("sha256").update(target, "utf8").digest();
  return timingSafeEqual(left, right);
}

export function signAdminToken(sessionId: string): string {
  return jwt.sign(
    { sub: "admin", role: "admin", sessionId },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export function verifyAdminToken(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; role?: string };
    return decoded && decoded.role === "admin";
  } catch {
    return false;
  }
}

export function toLegacyEvent(event: {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  startsAt: Date | string;
  venue: string;
  priceInCents: number;
  totalTickets: number;
  issuedTickets: number;
  status: string;
  termsOfUse: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}) {
  const startsAtStr = event.startsAt instanceof Date ? event.startsAt.toISOString() : String(event.startsAt);
  const createdStr = event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt);
  const updatedStr = event.updatedAt instanceof Date ? event.updatedAt.toISOString() : String(event.updatedAt);

  let statusStr = "ativa";
  if (event.status === "FINISHED") statusStr = "finalizada";
  if (event.status === "CANCELLED") statusStr = "cancelada";

  return {
    id: event.id,
    nome: event.name,
    descricao: event.description,
    imagem: event.imageUrl,
    data: startsAtStr,
    local: event.venue,
    preco: Number((event.priceInCents / 100).toFixed(2)),
    ingressosDisponiveis: Math.max(0, event.totalTickets - event.issuedTickets),
    ingressosTotal: event.totalTickets,
    linkPagamento: "",
    termosUso: event.termsOfUse,
    status: statusStr,
    createdAt: createdStr,
    updatedAt: updatedStr,
  };
}

export function toLegacyFesta(event: {
  id: string;
  name: string;
  totalTickets: number;
  issuedTickets: number;
  priceInCents: number;
  startsAt: Date | string;
  status: string;
}): Festa {
  const preco = Number((event.priceInCents / 100).toFixed(2));
  let statusStr: "ativa" | "finalizada" | "cancelada" = "ativa";
  if (event.status === "FINISHED") statusStr = "finalizada";
  if (event.status === "CANCELLED") statusStr = "cancelada";

  return {
    id: event.id,
    nome: event.name,
    quantidadeTotal: event.totalTickets,
    quantidadeVendidos: event.issuedTickets,
    valorUnitario: preco,
    lucroTotal: Number((event.totalTickets * preco).toFixed(2)),
    lucroAtual: Number((event.issuedTickets * preco).toFixed(2)),
    data: event.startsAt instanceof Date ? event.startsAt.toISOString() : String(event.startsAt),
    status: statusStr,
  };
}
