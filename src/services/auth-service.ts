import { findMockUser, toAuthUser } from "@/data/mock-users";
import { sleep } from "@/lib/utils";
import type {
  AuthService,
  AuthSession,
  LoginCredentials,
  LoginResult,
} from "@/types/auth";

const SESSION_STORAGE_KEY = "formularios-front.auth.session";

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function writeStoredSession(session: AuthSession | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

/**
 * Servicio de autenticación MOCK.
 * Sustituir esta implementación por un cliente API real sin cambiar AuthService.
 */
export class MockAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    await sleep(900);

    const email = credentials.email.trim();
    const password = credentials.password;

    if (!email || !password) {
      return {
        success: false,
        message: "El correo y la contraseña son obligatorios.",
      };
    }

    const user = findMockUser(email, password);
    if (!user) {
      return {
        success: false,
        message: "Correo o contraseña incorrectos. Usa un usuario de demostración.",
      };
    }

    const session: AuthSession = {
      user: toAuthUser(user),
      authenticatedAt: new Date().toISOString(),
    };

    writeStoredSession(session);

    return { success: true, session };
  }

  async logout(): Promise<void> {
    await sleep(200);
    writeStoredSession(null);
  }

  getSession(): AuthSession | null {
    return readStoredSession();
  }
}

export const authService: AuthService = new MockAuthService();
