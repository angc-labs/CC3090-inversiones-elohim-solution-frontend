export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;

const serverApiUrl = rawApiUrl?.replace(/\/+$/, "");

if (typeof window === "undefined" && !serverApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL no está configurada");
}

export const API_URL = typeof window === "undefined" ? serverApiUrl ?? "" : "";

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const maybePayload = payload as {
    error?: unknown;
    message?: unknown;
  };

  if (typeof maybePayload.error === "string") {
    return maybePayload.error;
  }

  if (typeof maybePayload.message === "string") {
    return maybePayload.message;
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  fallbackErrorMessage = "No se pudo completar la solicitud"
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
  });

  const payload = await response
    .json()
    .catch(() => null) as unknown;

  if (!response.ok) {
    const message = getErrorMessage(payload, fallbackErrorMessage);
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function buildAuthHeaders(token?: string): HeadersInit {
  if (!token) {
    return { "Content-Type": "application/json" };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}