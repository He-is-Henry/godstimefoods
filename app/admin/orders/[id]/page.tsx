import OrderDetailClient from "./order-detail.client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Order Audit - Admin Console",
  description: "Detailed order management audit trail for Godstime Food Canteen.",
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderDetailClient id={Number(id)} />;
}
