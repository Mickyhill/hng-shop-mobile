import { StyleSheet, Text, View } from "react-native";
import { useNav } from "../navigation";
import { Button, Screen } from "../components/ui";
import { colors, fonts } from "../theme";

export function SuccessScreen({ orderNumber, emailSent }: { orderNumber: string; emailSent: boolean }) {
  const nav = useNav();
  return (
    <Screen>
      <View style={s.wrap}>
        <View style={s.check}>
          <Text style={s.checkMark}>✓</Text>
        </View>
        <Text style={s.title}>Order placed</Text>
        <Text style={s.number}>{orderNumber}</Text>
        <Text style={s.body}>
          {emailSent
            ? "A confirmation email is on its way."
            : "Your order is saved. The confirmation email did not send, but your order is safe."}
        </Text>
        <Button label="View my orders" onPress={() => nav.reset({ name: "shop" }, { name: "orders" })} />
        <Button label="Continue shopping" variant="secondary" onPress={() => nav.reset({ name: "shop" })} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 24, gap: 14 },
  check: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successBg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  checkMark: { fontSize: 36, color: colors.success, fontWeight: "700" },
  title: { fontFamily: fonts.display, fontSize: 30, fontWeight: "700", color: colors.ink, textAlign: "center" },
  number: { fontSize: 18, fontWeight: "600", color: colors.primary, textAlign: "center" },
  body: { fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: "center", marginBottom: 8 },
});
