import type { Metadata } from "next";
import { getProductById } from "@/lib/products";
import ProductDetailClient from "./page.client";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    return {
      title: "Product Not Found - Godstime Foods",
    };
  }

  return {
    title: `${product.name} - Godstime Foods`,
    description: `Order ${product.name} for ₦${product.price.toLocaleString()} at Godstime Foods.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    alert(id)
    alert(product)
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
