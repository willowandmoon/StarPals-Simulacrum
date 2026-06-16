"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import type { CartItem, Favorite } from "@/types/global.d";

interface StoreContextType {
  cartItems: CartItem[];
  favIds: Set<string>;
  cartCount: number;
  favCount: number;
  storeLoaded: boolean;
  refreshCart: () => void;
  refreshFavs: () => void;
}

const StoreContext = createContext<StoreContextType>({
  cartItems: [],
  favIds: new Set(),
  cartCount: 0,
  favCount: 0,
  storeLoaded: false,
  refreshCart: () => {},
  refreshFavs: () => {},
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [storeLoaded, setStoreLoaded] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // No dependency on session — the API handles auth; 401 means empty.
  const refreshCart = useCallback(() => {
    fetch("/api/cart")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!mounted.current) return;
        setCartItems(Array.isArray(data?.items) ? data.items : []);
      })
      .catch(() => { if (mounted.current) setCartItems([]); });
  }, []);

  const refreshFavs = useCallback(() => {
    fetch("/api/favorites")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (!mounted.current) return;
        setFavIds(
          Array.isArray(data)
            ? new Set((data as Favorite[]).map((f) => f.productId))
            : new Set()
        );
      })
      .catch(() => { if (mounted.current) setFavIds(new Set()); });
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/cart").then((r) => r.ok ? r.json() : null),
        fetch("/api/favorites").then((r) => r.ok ? r.json() : []),
      ]).then(([cartData, favData]) => {
        if (!mounted.current) return;
        setCartItems(Array.isArray(cartData?.items) ? cartData.items : []);
        setFavIds(
          Array.isArray(favData)
            ? new Set((favData as Favorite[]).map((f) => f.productId))
            : new Set()
        );
        setStoreLoaded(true);
      }).catch(() => {
        if (mounted.current) setStoreLoaded(true);
      });
    } else if (status === "unauthenticated") {
      setCartItems([]);
      setFavIds(new Set());
      setStoreLoaded(true);
    }
  }, [status]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const favCount = favIds.size;

  return (
    <StoreContext.Provider value={{ cartItems, favIds, cartCount, favCount, storeLoaded, refreshCart, refreshFavs }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
