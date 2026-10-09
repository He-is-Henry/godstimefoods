"use client";

import ProductGallery from "@/components/ProductGallery";
import { ArrowLeft, ShoppingCart, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  product: Product;
};

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(1);

  const isOutOfStock =
    !product.isAvailable ||
    (product.availableQuantity !== null && product.availableQuantity <= 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-purple-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <ProductGallery images={product.images ?? []} title={product.name} />

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              {product.categories?.map((c) => (
                <span
                  key={c.id}
                  className="rounded-md bg-purple-950/60 border border-purple-500/20 px-2.5 py-1 text-xs text-purple-300"
                >
                  {c.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center justify-between border-y border-slate-800/80 py-4">
              <div>
                <span className="text-xs text-slate-400 block uppercase">
                  Price
                </span>
                <span className="text-2xl font-bold text-white">
                  ₦{product.price.toLocaleString()}
                </span>
              </div>

              <div>
                {isOutOfStock ? (
                  <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    In Stock {product.availableQuantity !== null ? `(${product.availableQuantity} left)` : ''}
                  </span>
                )}
              </div>
            </div>

            {!isOutOfStock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-slate-300">
                  Quantity:
                </span>
                <div className="flex items-center rounded-xl border border-purple-500/30 bg-slate-900/80">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-slate-300 hover:text-white cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-slate-300 hover:text-white cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isOutOfStock}
              className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>

            <div className="mt-8 flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400">
              <Truck className="h-5 w-5 text-purple-400 shrink-0" />
              <span>Fast local delivery available across Godstime locations.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
