import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth";
import { Button, Notice, Screen } from "../components/ui";
import { colors, fonts } from "../theme";

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={s.wrap}>
        <View style={s.mark}>
          <Text style={s.markLetter}>M</Text>
        </View>
        <Text style={s.title}>MickyHill Store</Text>
        <Text style={s.lead}>Handmade Nigerian goods. Sign in with the same Google account you use on the website. Your cart follows you.</Text>
        {error && <Notice tone="error" text={error} />}
        <Button label="Continue with Google" onPress={onSignIn} loading={busy} style={s.button} />
        <Text style={s.small}>By continuing you agree to the store's terms and privacy policy.</Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  markLetter: { fontFamily: fonts.display, fontSize: 40, fontWeight: "700", color: colors.primaryInk },
  title: { fontFamily: fonts.display, fontSize: 32, fontWeight: "700", color: colors.ink, textAlign: "center" },
  lead: { fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: "center" },
  button: { marginTop: 8 },
  small: { fontSize: 13, color: colors.muted, textAlign: "center" },
});
