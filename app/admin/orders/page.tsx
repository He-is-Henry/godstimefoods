import AdminOrdersClient from "./orders.client";

export const metadata = {
  title: "Order Management - Admin Console",
  description: "View and inspect customer orders in Godstime Foods admin control panel.",
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
