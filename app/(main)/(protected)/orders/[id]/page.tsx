import OrderDetailClient from "./order-detail.client";

export const metadata = {
  title: "Order Details - Godstime Food Canteen",
  description: "View specific food order details and track delivery status.",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailClient orderId={Number(id)} />;
}
