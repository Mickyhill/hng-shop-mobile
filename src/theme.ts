import { Platform } from "react-native";

/** Same colour tokens as the website (app/globals.css). */
export const colors = {
  bg: "#f4efe6",
  surface: "#ebe4d7",
  card: "#fbf8f2",
  ink: "#1f2430",
  muted: "#6e6a62",
  border: "#ddd3c2",
  borderStrong: "#b9ad98",
  primary: "#c2552f",
  primaryPressed: "#a8461f",
  primaryInk: "#fff8f2",
  success: "#3f7a52",
  successBg: "#e3efe6",
  error: "#b3392f",
  errorBg: "#f6e1de",
};

export const fonts = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
};

export const radius = { sm: 6, md: 10, lg: 18 };
