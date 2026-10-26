const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
    throw new ApiError(message ?? "No fue posible comunicarse con el servidor.", response.status);
  }
  return body as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
