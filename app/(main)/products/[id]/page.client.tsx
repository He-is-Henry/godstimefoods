"use client";

import ProductGallery from "@/components/ProductGallery";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Minus, Phone, Plus, ShoppingCart, Truck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  product: Product;
};

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(1);
  const { addItemToCart, cart, updateCartItem } = useCart();

  const alreadyIncart = cart.find((c) => c.productId === product.id);

  const isOutOfStock =
    !product.isAvailable ||
    (product.availableQuantity !== null && product.availableQuantity <= 0);

  const handleQuantityInput = (val: string) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQuantity(1);
    } else {
      setQuantity(parsed);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          type="button"
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
                    In Stock{" "}
                    {product.availableQuantity !== null
                      ? `(${product.availableQuantity} left)`
                      : ""}
                  </span>
                )}
              </div>
            </div>

            {!isOutOfStock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-slate-300">
                  Quantity:
                </span>
                <div className="flex items-center rounded-xl border border-purple-500/30 bg-slate-900/80 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => handleQuantityInput(e.target.value)}
                    className="w-16 text-center text-sm font-bold text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {!isOutOfStock ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (alreadyIncart) updateCartItem(alreadyIncart.id, quantity);
                      else addItemToCart(product, quantity);
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {alreadyIncart
                      ? `Update Cart (${quantity})`
                      : `Add to Cart (${quantity})`}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/checkout?productId=${product.id}&quantity=${quantity}`)
                    }
                    className="w-full py-3.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Zap className="h-4 w-4 fill-current text-pink-200" />
                    Buy Now ({quantity})
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed font-bold text-sm flex items-center justify-center gap-2"
                >
                  Unavailable
                </button>
              )}

              <a
                href="tel:09034830924"
                className="w-full py-3 px-6 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="h-4 w-4 text-purple-400" />
                Call to Order (09034830924)
              </a>
            </div>

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