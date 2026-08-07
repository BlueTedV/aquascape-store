"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CartItem } from "./types";

const STORAGE_KEY = "aqua-studio-cart";

type AddCartInput = Omit<CartItem, "quantity"> & { quantity?: number };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: AddCartInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  /** false until the persisted cart has been read from localStorage */
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Aqua Studio: failed to read cart from storage", error);
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load any previously saved cart once, on first mount in the browser.
  // localStorage isn't available during SSR, so this intentionally runs
  // post-mount and causes one extra render — the standard pattern for
  // hydrating client-only persisted state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStoredCart());
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever the cart changes (after initial load).
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Aqua Studio: failed to save cart to storage", error);
    }
  }, [items, isHydrated]);

  // Keep multiple open tabs in sync with each other.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        setItems(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Aqua Studio: failed to sync cart across tabs", error);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addItem = useCallback((item: AddCartInput) => {
    const quantity = Math.max(1, item.quantity ?? 1);

    setItems((current) => {
      const existing = current.find((line) => line.id === item.id);

      if (existing) {
        return current.map((line) =>
          line.id === item.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }

      return [...current, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((line) => line.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((line) => line.id !== id);
      }
      return current.map((line) =>
        line.id === id ? { ...line, quantity } : line,
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isHydrated,
    }),
    [items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, isHydrated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return context;
}
