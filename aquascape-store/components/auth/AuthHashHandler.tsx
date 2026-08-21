"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Global listener that captures Supabase auth callback hash fragments & query params
 * when redirected to root or any page (e.g. #access_token=...&type=recovery or type=signup).
 */
export default function AuthHashHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Inspect Hash parameters (e.g. #access_token=...&type=signup or type=recovery)
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.substring(1)
      : window.location.hash;

    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const type = hashParams.get("type");
      const errorDescription = hashParams.get("error_description");

      if (errorDescription) {
        router.replace(`/login?error=${encodeURIComponent(errorDescription)}`);
        return;
      }

      if (type === "recovery" && pathname !== "/reset-password") {
        router.replace(`/reset-password#${hash}`);
        return;
      }

      if (type === "signup" || type === "email_change" || type === "invite") {
        router.replace("/login?verified=true");
        return;
      }
    }

    // 2. Inspect Query parameters on root landing (e.g. ?type=recovery or ?type=signup)
    const searchParams = new URLSearchParams(window.location.search);
    const queryType = searchParams.get("type");
    const tokenHash = searchParams.get("token_hash");
    const code = searchParams.get("code");

    if (queryType === "recovery" && pathname !== "/reset-password") {
      router.replace(`/reset-password${window.location.search}`);
      return;
    }

    if (tokenHash && queryType === "signup") {
      router.replace(`/auth/confirm?token_hash=${tokenHash}&type=signup`);
      return;
    }

    if (code && pathname === "/") {
      // If code was returned to root without next route, send to callback
      router.replace(`/auth/callback?code=${code}`);
      return;
    }
  }, [pathname, router]);

  return null;
}
