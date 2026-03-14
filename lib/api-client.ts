"use client";

const STORAGE_KEY = "astradaily-admin-auth";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T }> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(pathOf(path), {
    ...options,
    headers,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message ?? res.statusText;
    throw new Error(msg);
  }
  return json;
}

function pathOf(p: string) {
  return p.startsWith("/api") ? p : `/api${p.startsWith("/") ? "" : "/"}${p}`;
}

export const api = {
  get: <T>(path: string) => request<T>(pathOf(path)),
  post: <T>(path: string, body?: unknown) =>
    request<T>(pathOf(path), {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(pathOf(path), {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (path: string) =>
    request<unknown>(pathOf(path), {
      method: "DELETE",
    }),
};
