"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-context";
import { getCurrentAccount, getStoredSession } from "./api/auth";
import { CartItem } from "./types";

type AddCartInput = Omit<CartItem, "quantity"> & { quantity?: number };

function getLoginRedirectPath() {
  if (typeof window === "undefined") return "/login";

  const currentPath = `${window.location.pathname}${window.location.search}`;
  return `/login?redirect=${encodeURIComponent(currentPath)}`;
}

/**
 * Auth-gated wrapper around the cart context.
 *
 * Intercepts `addItem` calls to check if the user is authenticated.
 * If unauthenticated or if the session is invalid, the user is redirected to the login
 * page with a redirect query param preserving their current route.
 */
export function useAuthCart() {
  const router = useRouter();
  const cart = useCart();

  const addItem = useCallback(
    async (item: AddCartInput) => {
      if (!getStoredSession()?.accessToken) {
        router.push(getLoginRedirectPath());
        return false;
      }

      try {
        await getCurrentAccount();
      } catch {
        router.push(getLoginRedirectPath());
        return false;
      }

      cart.addItem(item);
      return true;
    },
    [cart, router],
  );

  return {
    ...cart,
    addItem,
  };
}