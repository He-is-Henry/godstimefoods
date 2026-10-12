import type { Metadata } from "next";
import CheckoutClient from "./checkout.client";

export const metadata: Metadata = {
  title: "Checkout - Godstime Foods",
  description: "Complete your order and choose your delivery location.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
