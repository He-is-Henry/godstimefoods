"use client";

import ProductCard from "@/components/ProductCard";
import { useCategoriesQuery } from "@/queries/useCategories";
import { useProductQuery } from "@/queries/useProducts";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState(0);

  const { data: products, isLoading: productsLoading } =
    useProductQuery.products(selectedCategory === 0 ? undefined : selectedCategory);

  const { data: categories } = useCategoriesQuery.categories();

  const allCategories = [{ id: 0, name: "All Products" }, ...(categories ?? [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-purple-500/10">
        {allCategories.map((c) => {
          const isActive = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/40"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-purple-200 hover:border-purple-500/30"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {selectedCategory === 0
            ? "All Products"
            : categories?.find((c) => c.id === selectedCategory)?.name ?? "Products"}
        </h2>
        {products && (
          <span className="text-xs text-slate-400">
            Showing {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="aspect-square w-full rounded-xl bg-slate-800/80 mb-4" />
              <div className="h-4 w-3/4 rounded bg-slate-800 mb-2" />
              <div className="h-4 w-1/2 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
          <ShoppingBag className="h-12 w-12 text-slate-600 mb-3" />
          <p className="text-base font-semibold text-slate-300">
            No products found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try selecting another category or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              setCategory={setSelectedCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
