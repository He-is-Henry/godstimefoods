import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsClient from "./products.client";

export const metadata: Metadata = {
  title: "Catalog Management - Godstime Food Canteen Admin",
  description: "Manage products, categories, and media assets.",
};

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
