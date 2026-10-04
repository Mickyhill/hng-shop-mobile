import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { placeOrder, type CheckoutInput, type FieldErrors } from "../lib/api";
import { formatKobo, shippingFor } from "../lib/format";
import { useNav } from "../navigation";
import { Button, CenterMessage, Header, Notice, Screen } from "../components/ui";
import { colors, radius } from "../theme";

type Form = Pick<CheckoutInput, "fullName" | "phone" | "address" | "city">;

/** Same rules as the server (zod schema in app/api/checkout/route.ts). */
function validate(form: Form): FieldErrors {
  const errors: FieldErrors = {};
  if (form.fullName.trim().length < 2) errors.fullName = "Enter your full name";
  if (!/^\+?[0-9 ()-]{7,20}$/.test(form.phone.trim())) errors.phone = "Enter a valid phone number";
  if (form.address.trim().length < 5) errors.address = "Enter your delivery address";
  if (form.city.trim().length < 2) errors.city = "Enter your city and state";
  return errors;
}

export function CheckoutScreen() {
  const nav = useNav();
  const { session } = useAuth();
  const { lines, subtotalKobo, refresh } = useCart();
  const [form, setForm] = useState<Form>({
    fullName: (session?.user.user_metadata?.full_name as string | undefined) ?? "",
    phone: "",
    address: "",
    city: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const shipping = shippingFor(subtotalKobo);

  const set = (key: keyof Form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function onSubmit() {
    const found = validate(form);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const result = await placeOrder({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      return;
    }

    // The server empties the shared cart. Refresh now in case Realtime is slow.
    void refresh();
    nav.reset({ name: "shop" }, { name: "success", orderNumber: result.orderNumber, emailSent: result.emailSent });
  }

  if (lines.length === 0) {
    return (
      <Screen>
        <Header title="Checkout" />
        <CenterMessage
          title="Your cart is empty"
          action={<Button label="Go to shop" onPress={() => nav.reset({ name: "shop" })} />}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Checkout" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <Text style={s.section}>Delivery details</Text>
          <Text style={s.muted}>Confirmation goes to {session?.user.email}</Text>
          {formError && <Notice tone="error" text={formError} />}

          <Field label="Full name" value={form.fullName} onChangeText={set("fullName")} error={errors.fullName}
            autoComplete="name" textContentType="name" />
          <Field label="Phone number" value={form.phone} onChangeText={set("phone")} error={errors.phone}
            keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" placeholder="+234 801 234 5678" />
          <Field label="Delivery address" value={form.address} onChangeText={set("address")} error={errors.address}
            autoComplete="street-address" textContentType="fullStreetAddress" multiline />
          <Field label="City and state" value={form.city} onChangeText={set("city")} error={errors.city}
            placeholder="Uyo, Akwa Ibom" />

          <View style={s.summary}>
            {lines.map((l) => (
              <View key={l.productId} style={s.row}>
                <Text style={s.rowName} numberOfLines={1}>
                  {l.quantity} × {l.name}
                </Text>
                <Text style={s.rowValue}>{formatKobo(l.priceKobo * l.quantity)}</Text>
              </View>
            ))}
            <View style={s.divider} />
            <View style={s.row}>
              <Text style={s.rowName}>Shipping</Text>
              <Text style={s.rowValue}>{shipping === 0 ? "Free" : formatKobo(shipping)}</Text>
            </View>
            <View style={s.row}>
              <Text style={[s.rowName, s.strong]}>Total</Text>
              <Text style={[s.rowValue, s.strong]}>{formatKobo(subtotalKobo + shipping)}</Text>
            </View>
          </View>

          <Button label="Place order" onPress={onSubmit} loading={submitting} />
          <Text style={s.muted}>Payment on delivery. Final prices are checked by the store.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({ label, error, ...input }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[s.input, input.multiline && s.inputMulti, error ? s.inputError : null]}
      />
      {error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, paddingBottom: 48, gap: 14 },
  section: { fontSize: 18, fontWeight: "700", color: colors.ink },
  muted: { fontSize: 14, color: colors.muted },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: colors.ink },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
  },
  inputMulti: { minHeight: 80, textAlignVertical: "top" },
  inputError: { borderColor: colors.error },
  error: { fontSize: 13, color: colors.error },
  summary: {
    padding: 16,
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  rowName: { flex: 1, fontSize: 15, color: colors.ink },
  rowValue: { fontSize: 15, color: colors.ink },
  strong: { fontSize: 17, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 4 },
});
