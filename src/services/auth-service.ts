import { roleIdFromTrackCode } from "@/config/roles";
import { apiRequest, getApiErrorMessage } from "@/services/api-client";
import type { AuthService, AuthSession, LoginCredentials, LoginResult } from "@/types/auth";

const SESSION_STORAGE_KEY = "formularios-front.auth.session";

interface ApiLoginResponse {
  accessToken: string;
  user: { participantId: string; fullName: string; email: string; role: "participant" | "evaluator" | "admin"; track: { code: string } | null };
}

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (!session.user?.appRole) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function writeStoredSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export class ApiAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const isLocalLogin = Boolean(credentials.email);
      const response = await apiRequest<ApiLoginResponse>(isLocalLogin ? "/auth/local" : "/auth/google", {
        method: "POST",
        body: JSON.stringify(isLocalLogin ? { email: credentials.email } : { idToken: credentials.idToken }),
      });
      const roleId = response.user.track ? roleIdFromTrackCode(response.user.track.code) : null;
      if (!roleId && response.user.role !== "admin") return { success: false, message: "Tu usuario no tiene una prueba asignada." };
      const session: AuthSession = {
        accessToken: response.accessToken,
        authenticatedAt: new Date().toISOString(),
        user: { id: response.user.participantId, email: response.user.email, name: response.user.fullName, roleId, appRole: response.user.role },
      };
      writeStoredSession(session);
      return { success: true, session };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error) };
    }
  }

  async logout(): Promise<void> { writeStoredSession(null); }
  getSession(): AuthSession | null { return readStoredSession(); }
}

export const authService: AuthService = new ApiAuthService();
