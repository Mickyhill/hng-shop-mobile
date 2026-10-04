import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useCart } from "../lib/cart";
import { FREE_SHIPPING_THRESHOLD_KOBO, formatKobo, MAX_QTY, shippingFor } from "../lib/format";
import { useNav } from "../navigation";
import { Button, CenterMessage, Header, Notice, ProductVisual, QtyStepper, Screen } from "../components/ui";
import { colors, radius } from "../theme";

export function CartScreen() {
  const nav = useNav();
  const { lines, ready, live, error, subtotalKobo, setQuantity, remove, refresh } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const shipping = shippingFor(subtotalKobo);
  const toFree = FREE_SHIPPING_THRESHOLD_KOBO - subtotalKobo;

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const liveBadge = (
    <View style={s.live} accessibilityLabel={live ? "Live sync on" : "Connecting"}>
      <View style={[s.dot, { backgroundColor: live ? colors.success : colors.borderStrong }]} />
      <Text style={s.liveText}>{live ? "Live" : "…"}</Text>
    </View>
  );

  if (!ready) {
    return (
      <Screen>
        <Header title="Your cart" right={liveBadge} />
        {error ? (
          <CenterMessage title="Could not load your cart" body={error} action={<Button label="Try again" onPress={refresh} />} />
        ) : (
          <CenterMessage loading />
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Your cart" right={liveBadge} />
      <FlatList
        data={lines}
        keyExtractor={(l) => l.productId}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={s.headerGap}>
            {error && <Notice tone="error" text={error} />}
            <Text style={s.syncNote}>This cart is saved to your account. Changes on the website show here instantly.</Text>
          </View>
        }
        ListEmptyComponent={
          <CenterMessage
            title="Your cart is empty"
            body="Add something here or on the website."
            action={<Button label="Go to shop" onPress={() => nav.reset({ name: "shop" })} />}
          />
        }
        renderItem={({ item }) => (
          <View style={s.line}>
            <ProductVisual name={item.name} accent={item.accent} size="thumb" />
            <View style={s.lineBody}>
              <Text style={s.lineName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={s.muted}>{formatKobo(item.priceKobo)} each</Text>
              <View style={s.lineActions}>
                <QtyStepper
                  value={item.quantity}
                  min={0}
                  max={Math.max(1, Math.min(MAX_QTY, item.stock))}
                  onChange={(q) => setQuantity(item.productId, q)}
                  label={`Quantity of ${item.name}`}
                />
                <Pressable
                  onPress={() => remove(item.productId)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.name}`}
                  hitSlop={8}
                >
                  <Text style={s.remove}>Remove</Text>
                </Pressable>
              </View>
            </View>
            <Text style={s.lineTotal}>{formatKobo(item.priceKobo * item.quantity)}</Text>
          </View>
        )}
        ListFooterComponent={
          lines.length > 0 ? (
            <View style={s.summary}>
              <Row label="Subtotal" value={formatKobo(subtotalKobo)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatKobo(shipping)} />
              <Row label="Total" value={formatKobo(subtotalKobo + shipping)} strong />
              {toFree > 0 && <Text style={s.muted}>Add {formatKobo(toFree)} more for free shipping.</Text>}
              <Button label="Checkout" onPress={() => nav.push({ name: "checkout" })} style={s.checkout} />
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowText, strong && s.strong]}>{label}</Text>
      <Text style={[s.rowText, strong && s.strong]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  list: { padding: 16, paddingBottom: 48, gap: 12, flexGrow: 1 },
  headerGap: { gap: 10 },
  syncNote: { fontSize: 14, color: colors.muted },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  line: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lineBody: { flex: 1, gap: 4 },
  lineName: { fontSize: 16, fontWeight: "600", color: colors.ink },
  lineActions: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 6 },
  lineTotal: { fontSize: 15, fontWeight: "600", color: colors.ink },
  remove: { color: colors.primary, fontWeight: "600" },
  muted: { fontSize: 14, color: colors.muted },
  summary: {
    marginTop: 4,
    padding: 16,
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowText: { fontSize: 15, color: colors.ink },
  strong: { fontSize: 18, fontWeight: "700" },
  checkout: { marginTop: 6 },
});
