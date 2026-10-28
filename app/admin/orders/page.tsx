import AdminOrdersClient from "./orders.client";

export const metadata = {
  title: "Order Management - Admin Console",
  description: "View and manage customer orders in Godstime Food Canteen admin control panel.",
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
