"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "@/services/auth-service";
import type { AuthSession, AuthUser, LoginCredentials } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginCredentials
  ) => Promise<
    { ok: true; path: string } | { ok: false; message: string }
  >;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getSession();
    startTransition(() => {
      setSession(stored);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);
    if (!result.success) {
      return { ok: false as const, message: result.message };
    }
    setSession(result.session);
    const loggedUser = result.session.user;
    const path = loggedUser.appRole === "admin"
      ? "/admin"
      : loggedUser.roleId
        ? `/formularios/${loggedUser.roleId}`
        : "/login";
    return { ok: true as const, path };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      login,
      logout,
    }),
    [session, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return ctx;
}
