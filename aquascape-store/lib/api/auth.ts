export type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: string;
};

export type UserProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  role: string;
};

export type ShippingAddress = {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  tokenType: string;
  user: AuthUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
};

export type Account = {
  accessToken: string;
  user: AuthUser;
  profile: UserProfile | null;
  shippingAddress: ShippingAddress | null;
  isAdmin: boolean;
};

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ProfileInput = {
  fullName: string;
  phone: string;
};

export type ShippingInput = {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

type ApiResponse<T> = {
  data?: T;
  message?: string;
};

const STORAGE_KEY = "aquaku-shop-auth";
const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function storeSession(session: AuthSession) {
  if (typeof window === "undefined" || !session.accessToken) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken() {
  return getStoredSession()?.accessToken ?? null;
}

async function requestApi<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    if (!token) throw new Error("Authentication required.");
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    if (
      response.status === 401 ||
      response.status === 403 ||
      payload.message?.toLowerCase().includes("jwt") ||
      payload.message?.toLowerCase().includes("authentication")
    ) {
      clearStoredSession();
    }
    throw new Error(payload.message ?? "Request failed.");
  }

  if (payload.data === undefined) {
    throw new Error("Malformed API response.");
  }

  return payload.data;
}

export async function register(input: RegisterInput) {
  return requestApi<AuthSession>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(input: LoginInput) {
  return requestApi<AuthSession>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function forgotPassword(email: string) {
  return requestApi<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, password: string) {
  return requestApi<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentAccount() {
  return requestApi<Account>("/api/auth/me", {}, true);
}

export async function logout() {
  try {
    await requestApi<{ ok: boolean }>("/api/auth/logout", { method: "POST" }, true);
  } finally {
    clearStoredSession();
  }
}

export async function updateProfile(input: ProfileInput) {
  return requestApi<Account>(
    "/api/account/profile",
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    true,
  );
}

export async function updateShippingAddress(input: ShippingInput) {
  return requestApi<Account>(
    "/api/account/shipping-address",
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    true,
  );
}

export async function authenticatedRequest<T>(path: string, init: RequestInit = {}) {
  return requestApi<T>(path, init, true);
}

export async function publicRequest<T>(path: string, init: RequestInit = {}) {
  return requestApi<T>(path, init, false);
}