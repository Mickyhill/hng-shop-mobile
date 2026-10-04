import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import type { Product } from "./lib/types";

/** A small stack navigator. Screens below the top stay mounted, so lists keep their scroll. */

export type Route =
  | { name: "shop" }
  | { name: "product"; product: Product }
  | { name: "cart" }
  | { name: "checkout" }
  | { name: "success"; orderNumber: string; emailSent: boolean }
  | { name: "orders" };

type Entry = { key: number; route: Route };

type Nav = {
  push: (route: Route) => void;
  back: () => void;
  reset: (...routes: Route[]) => void;
  canGoBack: boolean;
};

const NavContext = createContext<Nav | null>(null);

export function Navigator({ render }: { render: (route: Route) => ReactNode }) {
  const nextKey = useRef(1);
  const [stack, setStack] = useState<Entry[]>([{ key: 0, route: { name: "shop" } }]);

  const make = (route: Route): Entry => ({ key: nextKey.current++, route });

  const push = useCallback((route: Route) => setStack((s) => [...s, make(route)]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const reset = useCallback(
    (...routes: Route[]) => setStack(routes.length ? routes.map(make) : [make({ name: "shop" })]),
    [],
  );

  // Android hardware back button.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (stack.length > 1) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, back]);

  const value = useMemo<Nav>(
    () => ({ push, back, reset, canGoBack: stack.length > 1 }),
    [push, back, reset, stack.length],
  );

  return (
    <NavContext.Provider value={value}>
      {stack.map((entry, i) => (
        <View
          key={entry.key}
          style={[StyleSheet.absoluteFill, { display: i === stack.length - 1 ? "flex" : "none" }]}
        >
          {render(entry.route)}
        </View>
      ))}
    </NavContext.Provider>
  );
}

export function useNav(): Nav {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside <Navigator>");
  return ctx;
}
