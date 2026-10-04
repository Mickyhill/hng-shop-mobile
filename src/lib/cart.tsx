import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { supabase } from "./supabase";
import { MAX_QTY } from "./format";
import type { CartLine, Product } from "./types";

/**
 * The account cart, stored in Supabase table cart_items.
 * The website reads and writes the same rows, and a Realtime subscription
 * pushes every change to this phone the moment it happens.
 */

type CartValue = {
  lines: CartLine[];
  count: number;
  subtotalKobo: number;
  ready: boolean;
  /** True while the Realtime connection is open. */
  live: boolean;
  error: string | null;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartValue | null>(null);

type Row = {
  product_id: string;
  quantity: number;
  products: { name: string; price_kobo: number; accent: string; stock: number } | null;
};

export function CartProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("cart_items")
      .select("product_id, quantity, products (name, price_kobo, accent, stock)")
      .order("updated_at", { ascending: true })
      .returns<Row[]>();

    if (loadError) {
      setError("Could not load your cart. Pull down to try again.");
      return;
    }
    setError(null);
    setLines(
      (data ?? []).flatMap((row) =>
        row.products
          ? [
              {
                productId: row.product_id,
                name: row.products.name,
                priceKobo: row.products.price_kobo,
                accent: row.products.accent,
                stock: row.products.stock,
                quantity: row.quantity,
              },
            ]
          : [],
      ),
    );
    setReady(true);
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void refresh(), 150);
  }, [refresh]);

  useEffect(() => {
    void refresh();

    const channel = supabase
      .channel(`cart-mobile-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` },
        () => scheduleRefresh(),
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    // Catch anything missed while the app was in the background.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") scheduleRefresh();
    });

    return () => {
      sub.remove();
      if (timer.current) clearTimeout(timer.current);
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh, scheduleRefresh]);

  const add = useCallback(
    (product: Product, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === product.id);
        if (existing) {
          return prev.map((l) =>
            l.productId === product.id
              ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) }
              : l,
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            priceKobo: product.price_kobo,
            accent: product.accent,
            stock: product.stock,
            quantity: Math.min(MAX_QTY, quantity),
          },
        ];
      });
      void supabase
        .rpc("cart_add", { p_product_id: product.id, p_quantity: quantity })
        .then(({ error: rpcError }) => {
          if (rpcError) setError("Could not add that item. Check your connection.");
          scheduleRefresh();
        });
    },
    [scheduleRefresh],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      const next = Math.min(MAX_QTY, quantity);
      setLines((prev) =>
        next <= 0
          ? prev.filter((l) => l.productId !== productId)
          : prev.map((l) => (l.productId === productId ? { ...l, quantity: next } : l)),
      );
      void supabase
        .rpc("cart_set", { p_product_id: productId, p_quantity: next })
        .then(({ error: rpcError }) => {
          if (rpcError) setError("Could not update your cart. Check your connection.");
          scheduleRefresh();
        });
    },
    [scheduleRefresh],
  );

  const remove = useCallback((productId: string) => setQuantity(productId, 0), [setQuantity]);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      ready,
      live,
      error,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalKobo: lines.reduce((n, l) => n + l.priceKobo * l.quantity, 0),
      add,
      setQuantity,
      remove,
      refresh,
    }),
    [lines, ready, live, error, add, setQuantity, remove, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
