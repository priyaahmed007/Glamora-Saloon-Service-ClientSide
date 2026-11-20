import { API_URL, authClient } from "./auth-client";

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let tokenCache: { token: string; expires: number } | null = null;

export const clearTokenCache = () => {
  tokenCache = null;
};

async function getToken(force = false): Promise<string | null> {
  if (!force && tokenCache && tokenCache.expires > Date.now()) return tokenCache.token;
  try {
    const res: any = await (authClient as any).token();
    const token = res?.data?.token;
    if (token) {
      tokenCache = { token, expires: Date.now() + 10 * 60 * 1000 };
      return token;
    }
  } catch {
    /* handled below */
  }
  return null;
}

interface Options {
  method?: string;
  body?: any;
  query?: Record<string, string | number | undefined | null>;
  auth?: boolean;
}

export async function api<T = any>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, query, auth = true } = options;

  const url = new URL(`${API_URL}${path}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });

  const send = async (forceToken: boolean) => {
    const headers: Record<string, string> = {};
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    if (body && !isForm) headers["Content-Type"] = "application/json";
    if (auth) {
      const token = await getToken(forceToken);
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return fetch(url.toString(), {
      method,
      headers,
      credentials: "include",
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  };

  let res: Response;
  try {
    res = await send(false);
    if (res.status === 401 && auth) {
      clearTokenCache();
      res = await send(true);
    }
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 0, "NETWORK");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.message || "Something went wrong. Please try again.", res.status, data?.code);
  }
  return data as T;
}

export async function uploadImage(file: File, kind: "avatar" | "service"): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new ApiError("Image is too large. Maximum size is 5 MB.", 400);
  const form = new FormData();
  form.append("image", file);
  const data = await api<{ url: string }>(`/upload/${kind}`, { method: "POST", body: form, auth: kind === "service" });
  return data.url;
}
