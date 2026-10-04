import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

/**
 * Google sign-in through Supabase Auth, the same provider the website uses,
 * so one Google account signs in to both.
 *
 * Flow (PKCE):
 * 1. Ask Supabase for the Google sign-in URL, with this app as the redirect.
 * 2. Open the URL in a secure in-app browser.
 * 3. Google sends the user back to Supabase, which redirects to the app with a code.
 * 4. Exchange the code for a session. The session is saved on the phone.
 */

type AuthValue = {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // In Expo Go: exp://<your-computer-ip>:8081/--/auth/callback
    // In a built app: mickyhillstore://auth/callback
    const redirectTo = Linking.createURL("auth/callback");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data.url) throw new Error("Could not start Google sign-in.");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") return; // The user closed the browser.

    const params = Linking.parse(result.url).queryParams ?? {};
    if (typeof params.error_description === "string") {
      throw new Error(params.error_description);
    }
    if (typeof params.code !== "string") {
      throw new Error(
        "Sign-in did not finish. Check that exp://** is in Supabase Redirect URLs.",
      );
    }

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
    if (exchangeError) throw exchangeError;
  }, []);

  const signOut = useCallback(async () => {
    // "local" signs out this phone only. The website stays signed in.
    await supabase.auth.signOut({ scope: "local" });
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
