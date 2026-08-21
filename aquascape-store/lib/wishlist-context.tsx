"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Product } from "./types";

const STORAGE_KEY = "aquaku_wishlist_v1";

interface WishlistContextType {
  items: Product[];
  isHydrated: boolean;
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => boolean; // returns true if added, false if removed
  isFavorited: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

function readStoredWishlist(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => p && typeof p.id === "string" && typeof p.name === "string");
  } catch (error) {
    console.error("Aquaku Shop: failed to read wishlist from storage", error);
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from storage on mount
  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) {
        setItems(readStoredWishlist());
        setIsHydrated(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Aquaku Shop: failed to save wishlist to storage", error);
    }
  }, [items, isHydrated]);

  // Sync across browser tabs
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch (error) {
        console.error("Aquaku Shop: failed to sync wishlist across tabs", error);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [product, ...prev];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleItem = useCallback((product: Product): boolean => {
    let added = false;
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        added = false;
        return prev.filter((p) => p.id !== product.id);
      } else {
        added = true;
        return [product, ...prev];
      }
    });
    return added;
  }, []);

  const isFavorited = useCallback(
    (productId: string): boolean => {
      return items.some((p) => p.id === productId);
    },
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.length;

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      itemCount,
      addItem,
      removeItem,
      toggleItem,
      isFavorited,
      clearWishlist,
    }),
    [items, isHydrated, itemCount, addItem, removeItem, toggleItem, isFavorited, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
