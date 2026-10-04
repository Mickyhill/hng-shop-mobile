/**
 * App configuration from .env (EXPO_PUBLIC_* values are bundled into the app).
 * Only public values belong here. Never put a secret key in a mobile app.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env, fill it in, then restart Expo.`);
  }
  return value;
}

export const config = {
  // Expo only inlines process.env.EXPO_PUBLIC_* when written out in full like this.
  supabaseUrl: required("EXPO_PUBLIC_SUPABASE_URL", process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required("EXPO_PUBLIC_SUPABASE_ANON_KEY", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? "https://mickyhill-store.vercel.app").replace(/\/+$/, ""),
};
