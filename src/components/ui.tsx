import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, radius } from "../theme";
import { useNav } from "../navigation";

/** Shared building blocks for every screen. */

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {children}
    </SafeAreaView>
  );
}

export function Header({ title, right }: { title: string; right?: ReactNode }) {
  const nav = useNav();
  return (
    <View style={styles.header}>
      {nav.canGoBack ? (
        <Pressable
          onPress={nav.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          style={styles.headerSide}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
      ) : (
        <View style={styles.headerSide} />
      )}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = "primary", disabled, loading, style }: ButtonProps) {
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && (primary ? styles.buttonPrimaryPressed : styles.buttonSecondaryPressed),
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.primaryInk : colors.ink} />
      ) : (
        <Text style={[styles.buttonText, { color: primary ? colors.primaryInk : colors.ink }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/** Same idea as the website's product visual: the first letter on the product colour. */
export function ProductVisual({
  name,
  accent,
  size,
}: {
  name: string;
  accent: string;
  size: "thumb" | "card" | "hero";
}) {
  const dims = { thumb: 56, card: undefined, hero: undefined }[size];
  const fontSize = { thumb: 24, card: 48, hero: 96 }[size];
  return (
    <View
      accessible={false}
      style={[
        styles.visual,
        { backgroundColor: accent },
        dims ? { width: dims, height: dims } : { width: "100%", aspectRatio: size === "hero" ? 1.2 : 1 },
        size === "thumb" && { borderRadius: radius.sm },
      ]}
    >
      <View style={styles.visualRing} />
      <Text style={[styles.visualLetter, { fontSize }]}>{name.trim().charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function QtyStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <View style={styles.qty} accessibilityLabel={label}>
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={6}
        style={[styles.qtyButton, value <= min && styles.buttonDisabled]}
      >
        <Text style={styles.qtyButtonText}>−</Text>
      </Pressable>
      <Text style={styles.qtyValue}>{value}</Text>
      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={6}
        style={[styles.qtyButton, value >= max && styles.buttonDisabled]}
      >
        <Text style={styles.qtyButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

export function CenterMessage({
  title,
  body,
  action,
  loading,
}: {
  title?: string;
  body?: string;
  action?: ReactNode;
  loading?: boolean;
}) {
  return (
    <View style={styles.center}>
      {loading && <ActivityIndicator color={colors.primary} size="large" />}
      {title && <Text style={styles.centerTitle}>{title}</Text>}
      {body && <Text style={styles.muted}>{body}</Text>}
      {action}
    </View>
  );
}

export function Notice({ tone, text }: { tone: "error" | "success"; text: string }) {
  const error = tone === "error";
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, { backgroundColor: error ? colors.errorBg : colors.successBg }]}
    >
      <Text style={{ color: error ? colors.error : colors.success }}>{text}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerSide: { minWidth: 72 },
  headerRight: { alignItems: "flex-end" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: "600",
    color: colors.ink,
  },
  backText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonPrimaryPressed: { backgroundColor: colors.primaryPressed },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderStrong },
  buttonSecondaryPressed: { backgroundColor: colors.surface },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { fontSize: 16, fontWeight: "600" },
  visual: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  visualRing: {
    position: "absolute",
    width: "140%",
    aspectRatio: 1,
    borderRadius: 9999,
    borderWidth: 18,
    borderColor: "rgba(255,255,255,0.12)",
  },
  visualLetter: { fontFamily: fonts.display, fontWeight: "700", color: "rgba(255,248,242,0.92)" },
  qty: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  qtyButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  qtyButtonText: { fontSize: 20, color: colors.ink },
  qtyValue: { minWidth: 28, textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.ink },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  centerTitle: { fontFamily: fonts.display, fontSize: 22, fontWeight: "600", color: colors.ink, textAlign: "center" },
  muted: { color: colors.muted, fontSize: 15, textAlign: "center" },
  notice: { padding: 12, borderRadius: radius.md },
});
