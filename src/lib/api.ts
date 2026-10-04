import { config } from "./config";
import { supabase } from "./supabase";

/**
 * Calls the website's own checkout endpoint (POST /api/checkout).
 * The phone sends its Supabase access token, so the server knows who is ordering.
 * Prices and stock are checked on the server, never trusted from the phone.
 */

export type CheckoutInput = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  items: { productId: string; quantity: number }[];
};

export type FieldErrors = Partial<Record<keyof CheckoutInput, string>>;

export type CheckoutResult =
  | { ok: true; orderId: string; orderNumber: string; emailSent: boolean }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, error: "Please sign in again." };

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, error: "No connection. Check your internet and try again." };
  }

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    return {
      ok: false,
      error: typeof body.error === "string" ? body.error : "Something went wrong. Try again.",
      fieldErrors: (body.fieldErrors ?? undefined) as FieldErrors | undefined,
    };
  }

  return {
    ok: true,
    orderId: String(body.orderId),
    orderNumber: String(body.orderNumber),
    emailSent: body.emailSent === true,
  };
}
