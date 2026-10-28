import type { Metadata } from "next";
import HomePage from "./page.client";

export const metadata: Metadata = {
  title: "Godstime Food Canteen | Freshly Prepared Meals & Fast Delivery",
  description:
    "Browse and order delicious, freshly prepared meals delivered fast from Godstime Food Canteen.",
  openGraph: {
    title: "Godstime Food Canteen | Freshly Prepared Meals & Fast Delivery",
    description:
      "Browse and order delicious, freshly prepared meals delivered fast from Godstime Food Canteen.",
    type: "website",
  },
};

export default function Home() {
  return <HomePage />;
}
