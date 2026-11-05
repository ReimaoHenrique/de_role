export const ADMIN_SESSION_COOKIE = "dr_admin_session";

const DEFAULT_MAX_AGE = 8 * 60 * 60; // 8 horas

/**
 * O JWT fica em cookie httpOnly: nenhum JavaScript do browser consegue lê-lo.
 */
export function adminSessionCookieOptions(expiresAt?: string) {
  const parsed = expiresAt ? Date.parse(expiresAt) : Number.NaN;
  const maxAge = Number.isFinite(parsed)
    ? Math.max(0, Math.floor((parsed - Date.now()) / 1000))
    : DEFAULT_MAX_AGE;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function clearedAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
