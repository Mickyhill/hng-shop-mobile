import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import { formatDate, formatKobo } from "../lib/format";
import type { Order } from "../lib/types";
import { useNav } from "../navigation";
import { Button, CenterMessage, Header, Screen } from "../components/ui";
import { colors, radius } from "../theme";

export function OrdersScreen() {
  const nav = useNav();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    // Row Level Security returns only this user's orders.
    const { data, error: loadError } = await supabase
      .from("orders")
      .select("id, order_number, status, total_kobo, created_at, order_items (id, product_name, quantity, line_total_kobo)")
      .order("created_at", { ascending: false })
      .returns<Order[]>();
    if (loadError) setError("Could not load your orders.");
    else {
      setError(null);
      setOrders(data ?? []);
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

  return (
    <Screen>
      <Header title="My orders" />
      {orders === null ? (
        error ? (
          <CenterMessage title="Something went wrong" body={error} action={<Button label="Try again" onPress={load} />} />
        ) : (
          <CenterMessage loading />
        )
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <CenterMessage
              title="No orders yet"
              body="Orders from the website and this app show here."
              action={<Button label="Go to shop" onPress={() => nav.reset({ name: "shop" })} />}
            />
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.number}>{item.order_number}</Text>
                <Text style={s.status}>{item.status}</Text>
              </View>
              <Text style={s.muted}>{formatDate(item.created_at)}</Text>
              {item.order_items.map((it) => (
                <View key={it.id} style={s.row}>
                  <Text style={s.itemName} numberOfLines={1}>
                    {it.quantity} × {it.product_name}
                  </Text>
                  <Text style={s.itemValue}>{formatKobo(it.line_total_kobo)}</Text>
                </View>
              ))}
              <View style={[s.row, s.totalRow]}>
                <Text style={s.total}>Total</Text>
                <Text style={s.total}>{formatKobo(item.total_kobo)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  list: { padding: 16, paddingBottom: 48, gap: 12, flexGrow: 1 },
  card: {
    padding: 16,
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  number: { fontSize: 16, fontWeight: "700", color: colors.ink },
  status: { fontSize: 13, fontWeight: "600", color: colors.primary, textTransform: "capitalize" },
  muted: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  itemName: { flex: 1, fontSize: 15, color: colors.ink },
  itemValue: { fontSize: 15, color: colors.ink },
  totalRow: { marginTop: 4, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  total: { fontSize: 16, fontWeight: "700", color: colors.ink },
});
