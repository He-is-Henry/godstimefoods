import type { Metadata } from "next";
import CartClient from "./cart.client";

export const metadata: Metadata = {
  title: "Shopping Cart - Godstime Food Canteen",
  description: "Review items in your shopping cart before checkout.",
};

export default function CartPage() {
  return <CartClient />;
}
