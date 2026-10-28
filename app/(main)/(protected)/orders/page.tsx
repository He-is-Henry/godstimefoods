import OrdersClient from "./orders.client";

export const metadata = {
  title: "My Orders - Godstime Food Canteen",
  description: "View and track your active and past food orders.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
