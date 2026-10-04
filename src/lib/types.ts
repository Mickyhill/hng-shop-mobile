/** Mirrors the website's lib/types.ts. Money is always integer kobo. */
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price_kobo: number;
  stock: number;
  accent: string;
};

export type CartLine = {
  productId: string;
  name: string;
  priceKobo: number;
  accent: string;
  stock: number;
  quantity: number;
};

export type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  line_total_kobo: number;
};

export type Order = {
  id: string;
  order_number: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
  total_kobo: number;
  created_at: string;
  order_items: OrderItem[];
};
