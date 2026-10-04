import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCart } from "../lib/cart";
import { formatKobo, MAX_QTY } from "../lib/format";
import type { Product } from "../lib/types";
import { useNav } from "../navigation";
import { Button, Header, Notice, ProductVisual, QtyStepper, Screen } from "../components/ui";
import { colors, fonts } from "../theme";

export function ProductScreen({ product }: { product: Product }) {
  const nav = useNav();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock === 0;
  const max = Math.max(1, Math.min(MAX_QTY, product.stock));

  function onAdd() {
    add(product, qty);
    setAdded(true);
  }

  return (
    <Screen>
      <Header title={product.category} />
      <ScrollView contentContainerStyle={s.body}>
        <ProductVisual name={product.name} accent={product.accent} size="hero" />
        <Text style={s.name}>{product.name}</Text>
        <Text style={s.price}>{formatKobo(product.price_kobo)}</Text>
        <Text style={s.description}>{product.description}</Text>
        <Text style={[s.stock, soldOut && { color: colors.error }]}>
          {soldOut ? "Sold out" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
        </Text>

        {!soldOut && (
          <View style={s.actions}>
            <QtyStepper value={qty} max={max} onChange={setQty} label={`Quantity of ${product.name}`} />
            <Button label="Add to cart" onPress={onAdd} style={s.addButton} />
          </View>
        )}

        {added && (
          <View style={s.added}>
            <Notice tone="success" text="Added to your cart. It now shows on the website too." />
            <Button label="View cart" variant="secondary" onPress={() => nav.push({ name: "cart" })} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, paddingBottom: 48, gap: 10 },
  name: { marginTop: 8, fontFamily: fonts.display, fontSize: 28, fontWeight: "700", color: colors.ink },
  price: { fontSize: 20, fontWeight: "600", color: colors.ink },
  description: { fontSize: 16, lineHeight: 24, color: colors.ink },
  stock: { fontSize: 14, color: colors.success, fontWeight: "600" },
  actions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  addButton: { flex: 1 },
  added: { gap: 10, marginTop: 4 },
});
