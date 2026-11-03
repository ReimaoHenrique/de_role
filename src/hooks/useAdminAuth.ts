// Hook for admin authentication and authorized fetches

import { useState, useCallback } from "react";

const TOKEN_STORAGE_KEY = "admin_token";

export interface UseAdminAuthReturn {
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null
  );
  const isAuthenticated = !!token;

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setToken(null);
  }, []);

  const fetchWithAuth = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      headers.set("Content-Type", "application/json");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      const response = await fetch(input, {
        ...init,
        headers,
      });
      if (response.status === 401 || response.status === 403) {
        logout();
      }
      return response;
    },
    [token, logout]
  );

  return { token, isAuthenticated, logout, fetchWithAuth };
}
