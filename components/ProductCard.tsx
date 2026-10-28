"use client";

import { useCart } from "@/context/CartContext";
import { Camera, Minus, Plus, ShoppingCart, Trash2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  product: Product;
};

const LOW_STOCK_THRESHOLD = 10;
const SYNC_DELAY_MS = 400;

export default function ProductCard({ product }: Props) {
  const { addItemToCart, updateCartItem, removeItemFromCart, cart } = useCart();

  const cartItem = cart.find((c) => c.productId === product.id);
  const [localQty, setLocalQty] = useState(cartItem?.quantity ?? 1);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Follow external cart changes (e.g. cleared from the navbar)
  useEffect(() => {
    setLocalQty(cartItem?.quantity ?? 1);
  }, [cartItem?.quantity]);

  // Clear any pending sync on unmount
  useEffect(
    () => () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    },
    []
  );

  const maxAvailable = product.availableQuantity ?? Infinity;
  const isOutOfStock =
    !product.isAvailable ||
    (product.availableQuantity !== null && product.availableQuantity <= 0);
  const isLowStock =
    !isOutOfStock &&
    product.availableQuantity !== null &&
    product.availableQuantity < LOW_STOCK_THRESHOLD;

  const handleStep = (delta: number) => {
    if (!cartItem) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);

    // Stepping below 1 removes immediately (no "0 in cart" flicker)
    if (localQty + delta < 1) {
      removeItemFromCart(cartItem.id);
      return;
    }

    const next = Math.min(localQty + delta, maxAvailable);
    setLocalQty(next);
    syncTimer.current = setTimeout(
      () => updateCartItem(cartItem.id, next),
      SYNC_DELAY_MS
    );
  };

  // Buy Now orders only this product. The cart is never touched.
  const buyHref = `/checkout?productId=${product.id}&quantity=${cartItem ? localQty : 1}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-500/10 bg-slate-900/60 p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-950/30 sm:p-3.5">
      {/* Image */}
      <div className="relative mb-3 aspect-4/3 w-full overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/70">
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "opacity-50 grayscale" : ""
              }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            <Camera className="h-8 w-8" />
          </div>
        )}

        {isOutOfStock && (
          <span className="absolute right-2 top-2 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-300 backdrop-blur-md">
            Sold out
          </span>
        )}
        {isLowStock && (
          <span className="absolute right-2 top-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-md">
            Only {product.availableQuantity} left
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        {/* Stretched link: the ::after covers the whole card */}
        <h3 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-purple-300 sm:text-base">
          <Link
            href={`/products/${product.id}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-xs leading-snug text-slate-400">
            {product.description}
          </p>
        )}

        <p className="mt-auto pt-2 text-base font-bold text-white sm:text-lg">
          ₦{product.price.toLocaleString("en-NG")}
        </p>
      </div>

      {/* Actions: sit above the stretched link */}
      <div className="relative z-10 mt-3">
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="min-h-10 w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-800/60 px-3 text-xs font-semibold text-slate-500"
          >
            Unavailable
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {cartItem ? (
              <div className="flex min-h-10 flex-1 items-center justify-between rounded-xl border border-purple-500/40 bg-purple-950/50 px-1">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  aria-label={localQty === 1 ? "Remove from cart" : "Decrease quantity"}
                  className="rounded-lg p-1.5 text-purple-300 transition-colors hover:bg-purple-800/40 hover:text-white"
                >
                  {localQty === 1 ? (
                    <Trash2 className="h-4 w-4 text-red-400" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </button>

                <span className="select-none text-xs font-bold text-white">
                  {localQty}
                  <span className="hidden font-medium text-purple-300 sm:inline"> in cart</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  disabled={localQty >= maxAvailable}
                  aria-label="Increase quantity"
                  className="rounded-lg p-1.5 text-purple-300 transition-colors hover:bg-purple-800/40 hover:text-white disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addItemToCart(product, 1)}
                aria-label="Add to cart"
                className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-2 text-xs font-semibold text-white shadow-lg shadow-purple-950/50 transition-all hover:bg-purple-500 active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  Add<span className="hidden sm:inline"> to Cart</span>
                </span>
              </button>
            )}

            <Link
              href={buyHref}
              title="Order this now"
              className="flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-xl bg-linear-to-r from-pink-600 to-purple-600 px-3 text-xs font-bold text-white shadow-md shadow-pink-950/40 transition-all hover:from-pink-500 hover:to-purple-500 active:scale-95"
            >
              <Zap className="h-4 w-4 fill-current text-pink-200" />
              Buy
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40 p-2.5 sm:p-3.5">
      <div className="mb-3 aspect-4/3 w-full rounded-xl bg-slate-800/80" />
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-800" />
      <div className="mb-1.5 h-3 w-full rounded bg-slate-800/70" />
      <div className="mb-4 h-3 w-2/3 rounded bg-slate-800/70" />
      <div className="mb-3 h-5 w-1/3 rounded bg-slate-800" />
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-xl bg-slate-800" />
        <div className="h-10 w-16 rounded-xl bg-slate-800" />
      </div>
    </div>
  );
}