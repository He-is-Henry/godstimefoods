import OrdersClient from "./orders.client";

export const metadata = {
  title: "My Orders - Godstime Foods",
  description: "View and track your active and past food orders.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
