import type { User } from "firebase/auth";

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(user: User, path: string, options: RequestInit = {}, timeoutMs = 25_000): Promise<T> {
  if (!apiBaseUrl) throw new ApiError("Set EXPO_PUBLIC_API_URL in mobile/.env before connecting to Wanderify.");
  const token = await user.getIdToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(payload.error || `Request failed (${response.status}).`, response.status);
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError("The request timed out. Check your connection and retry.");
    throw new ApiError("Could not reach Wanderify. Check the backend URL and your network.");
  } finally {
    clearTimeout(timeout);
  }
}
