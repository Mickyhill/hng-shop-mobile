import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { formatKobo } from "../lib/format";
import type { Product } from "../lib/types";
import { useNav } from "../navigation";
import { Button, CenterMessage, ProductVisual, Screen } from "../components/ui";
import { colors, fonts, radius } from "../theme";

export function ShopScreen() {
  const nav = useNav();
  const { session, signOut } = useAuth();
  const { count } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("products")
      .select("id, slug, name, description, category, price_kobo, stock, accent")
      .order("created_at", { ascending: true })
      .returns<Product[]>();
    if (loadError) setError("Could not load products. Check your connection.");
    else {
      setError(null);
      setProducts(data ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function onAccount() {
    Alert.alert(session?.user.email ?? "Account", undefined, [
      { text: "My orders", onPress: () => nav.push({ name: "orders" }) },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
      { text: "Close", style: "cancel" },
    ]);
  }

  return (
    <Screen>
      <View style={s.top}>
        <Pressable onPress={onAccount} accessibilityRole="button" accessibilityLabel="Account menu" hitSlop={8}>
          <Text style={s.topLink}>Account</Text>
        </Pressable>
        <Text style={s.brand}>MickyHill</Text>
        <Pressable
          onPress={() => nav.push({ name: "cart" })}
          accessibilityRole="button"
          accessibilityLabel={`Cart, ${count} items`}
          hitSlop={8}
          style={s.cartButton}
        >
          <Text style={s.topLink}>Cart</Text>
          {count > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{count}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {products === null && !error ? (
        <CenterMessage loading />
      ) : error && !products ? (
        <CenterMessage title="Something went wrong" body={error} action={<Button label="Try again" onPress={load} />} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            <View style={s.intro}>
              <Text style={s.heading}>Made by hand, made to last</Text>
              <Text style={s.lead}>Free delivery on orders over ₦50,000.</Text>
            </View>
          }
          ListEmptyComponent={<CenterMessage title="No products yet" body="Check back soon." />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => nav.push({ name: "product", product: item })}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${formatKobo(item.price_kobo)}`}
              style={({ pressed }) => [s.card, pressed && s.cardPressed]}
            >
              <ProductVisual name={item.name} accent={item.accent} size="card" />
              <Text style={s.category}>{item.category}</Text>
              <Text style={s.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={s.price}>{formatKobo(item.price_kobo)}</Text>
              {item.stock === 0 && <Text style={s.soldOut}>Sold out</Text>}
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brand: { fontFamily: fonts.display, fontSize: 22, fontWeight: "700", color: colors.ink },
  topLink: { fontSize: 16, fontWeight: "600", color: colors.primary },
  cartButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.primaryInk, fontSize: 12, fontWeight: "700" },
  list: { padding: 16, paddingBottom: 40, gap: 16, flexGrow: 1 },
  row: { gap: 16 },
  intro: { gap: 4, marginBottom: 4 },
  heading: { fontFamily: fonts.display, fontSize: 26, fontWeight: "700", color: colors.ink },
  lead: { fontSize: 15, color: colors.muted },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 4,
  },
  cardPressed: { opacity: 0.85 },
  category: { marginTop: 6, fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.6 },
  name: { fontSize: 15, fontWeight: "600", color: colors.ink },
  price: { fontSize: 15, color: colors.ink },
  soldOut: { fontSize: 13, color: colors.error, fontWeight: "600" },
});
