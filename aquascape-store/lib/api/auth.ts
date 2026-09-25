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
  expiresAt?: number | null;
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

/**
 * Client-side Authentication & Session Management.
 *
 * Manages JWT tokens in localStorage, dispatches reactive auth state changes
 * across React contexts via custom DOM events, deduplicates concurrent token
 * refresh requests, and provides automatic retry-on-401 fetch wrappers.
 */

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

/**
 * Persist the authentication session to localStorage and broadcast an auth change event
 * to notify active UI components and contexts (such as the cart provider) immediately.
 */
export function storeSession(session: AuthSession) {
  if (typeof window === "undefined" || !session.accessToken) return;

  const expiresInSeconds = session.expiresIn ?? 86400; // Default to 24h if unspecified
  // If expiresAt is provided and safely in the future (> 1 minute), preserve it; otherwise calculate fresh timestamp
  const expiresAt =
    session.expiresAt && session.expiresAt > Date.now() + 60 * 1000
      ? session.expiresAt
      : Date.now() + expiresInSeconds * 1000;

  const sessionToStore: AuthSession = {
    ...session,
    expiresIn: expiresInSeconds,
    expiresAt,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToStore));
  window.dispatchEvent(new CustomEvent("aquaku-shop-auth-change", { detail: sessionToStore }));
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem("aquaku-shop-cart");
  window.dispatchEvent(new CustomEvent("aquaku-shop-auth-change", { detail: null }));
}

export function getAccessToken() {
  return getStoredSession()?.accessToken ?? null;
}

let refreshPromise: Promise<AuthSession | null> | null = null;

/**
 * Exchanges the current refresh token for a new access token.
 *
 * Concurrent refresh invocations are deduplicated via `refreshPromise` so multiple
 * parallel API calls share a single refresh network request instead of racing.
 */
export async function refreshSession(): Promise<AuthSession | null> {
  if (typeof window === "undefined") return null;

  const currentSession = getStoredSession();
  if (!currentSession?.refreshToken) {
    clearStoredSession();
    return null;
  }

  // Deduplicate concurrent refresh calls
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
      });

      const payload = (await response.json().catch(() => ({}))) as ApiResponse<AuthSession>;

      if (!response.ok || !payload.data?.accessToken) {
        clearStoredSession();
        return null;
      }

      const refreshed = payload.data;
      const expiresIn = refreshed.expiresIn ?? currentSession.expiresIn ?? 86400;
      const mergedSession: AuthSession = {
        ...currentSession,
        ...refreshed,
        expiresIn,
        expiresAt: Date.now() + expiresIn * 1000,
        refreshToken: refreshed.refreshToken || currentSession.refreshToken,
        user: refreshed.user || currentSession.user,
        profile: refreshed.profile || currentSession.profile,
        isAdmin: refreshed.isAdmin ?? currentSession.isAdmin,
      };

      storeSession(mergedSession);
      return mergedSession;
    } catch {
      clearStoredSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function getValidAccessToken(): Promise<string | null> {
  const session = getStoredSession();
  if (!session?.accessToken) return null;

  // Proactively refresh access token if expiring within 2-minute buffer to avoid unexpected 401s
  const BUFFER_MS = 2 * 60 * 1000;
  if (session.expiresAt && Date.now() + BUFFER_MS >= session.expiresAt && session.refreshToken) {
    const refreshed = await refreshSession();
    return refreshed?.accessToken ?? null;
  }

  return session.accessToken;
}

async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  authenticated = false,
  isRetry = false
): Promise<T> {
  let token: string | null = null;
  // Resolve valid Bearer token for protected endpoints; wipe session if credentials expired
  if (authenticated) {
    token = await getValidAccessToken();
    if (!token) {
      clearStoredSession();
      throw new Error("Authentication required.");
    }
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    // Intercept 401/403 or JWT expiry on authenticated requests: refresh once and replay
    if (
      authenticated &&
      !isRetry &&
      (response.status === 401 ||
        response.status === 403 ||
        payload.message?.toLowerCase().includes("jwt") ||
        payload.message?.toLowerCase().includes("expired") ||
        payload.message?.toLowerCase().includes("authentication"))
    ) {
      const refreshed = await refreshSession();
      if (refreshed?.accessToken) {
        return requestApi<T>(path, init, true, true);
      }
    }

    // Invalidate local session if refresh fails or authorization is permanently rejected
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