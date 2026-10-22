import type { RoleId } from "@/config/roles";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roleId: RoleId;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
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
