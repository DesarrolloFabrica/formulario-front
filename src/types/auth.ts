import type { RoleId } from "@/config/roles";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roleId: RoleId | null;
  appRole: "participant" | "evaluator" | "admin";
}

export interface LoginCredentials {
  idToken?: string;
  email?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  authenticatedAt: string;
}

export interface AuthResult {
  success: true;
  session: AuthSession;
}

export interface AuthError {
  success: false;
  message: string;
}

export type LoginResult = AuthResult | AuthError;

export interface AuthService {
  login(credentials: LoginCredentials): Promise<LoginResult>;
  logout(): Promise<void>;
  getSession(): AuthSession | null;
}
