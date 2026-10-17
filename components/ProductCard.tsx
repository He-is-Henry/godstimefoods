"use client";

import { useCart } from "@/context/CartContext";
import { Camera, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  product: Product;
  setCategory: (categoryId: number) => void;
};

export default function ProductCard({ product, setCategory }: Props) {
  const router = useRouter();
  const { addItemToCart, updateCartItem, cart } = useCart();

  const alreadyInCart = cart.find((c) => c.productId === product.id);
  const cartQuantity = alreadyInCart?.quantity;

  const [prevCartQuantity, setPrevCartQuantity] = useState(cartQuantity);
  const [inputValue, setInputValue] = useState<string>(
    cartQuantity ? String(cartQuantity) : "1"
  );

  if (cartQuantity !== prevCartQuantity) {
    setPrevCartQuantity(cartQuantity);
    setInputValue(cartQuantity !== undefined ? String(cartQuantity) : "1");
  }

  const isOutOfStock =
    !product.isAvailable ||
    (product.availableQuantity !== null && product.availableQuantity <= 0);

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === "" || /^\d+$/.test(rawVal)) {
      setInputValue(rawVal);
    }
  };

  const commitQuantity = (rawVal: string) => {
    const parsed = parseInt(rawVal, 10);
    const finalQty = isNaN(parsed) || parsed < 1 ? 1 : parsed;

    setInputValue(String(finalQty));

    if (alreadyInCart && finalQty !== cartQuantity) {
      updateCartItem(alreadyInCart.id, finalQty);
    }
  };

  const handleInputBlur = () => {
    commitQuantity(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitQuantity(inputValue);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleQuantityStep = (delta: number) => {
    const current = parseInt(inputValue, 10) || 1;
    const nextVal = Math.max(1, current + delta);
    setInputValue(String(nextVal));

    if (alreadyInCart && nextVal !== cartQuantity) {
      updateCartItem(alreadyInCart.id, nextVal);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const qty = parseInt(inputValue, 10) || 1;
    addItemToCart(product, qty);
  };

  const handleInstantOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const qty = parseInt(inputValue, 10) || 1;
    router.push(`/checkout?productId=${product.id}&quantity=${qty}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-500/10 bg-slate-900/60 p-4 transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-950/20 cursor-pointer"
    >
      <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950/60 border border-slate-800">
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <Camera className="h-10 w-10 opacity-50" />
            <span className="mt-1 text-xs">No image</span>
          </div>
        )}

        {isOutOfStock ? (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-red-400 backdrop-blur-md">
            Out of Stock
          </span>
        ) : product.availableQuantity !== null && product.availableQuantity < 10 ? (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-md">
            Only {product.availableQuantity} left
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {product.categories?.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCategory(c.id);
                }}
                className="rounded-md bg-purple-950/50 border border-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-300 hover:border-purple-500/40 hover:text-white transition-all z-10"
              >
                {c.name}
              </button>
            ))}
          </div>

          <h3 className="line-clamp-1 text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-medium text-slate-400">
                Price
              </span>
              <span className="text-base font-bold text-white">
                ₦{product.price.toLocaleString()}
              </span>
            </div>
          </div>

          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {alreadyInCart ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-between rounded-xl border border-purple-500/40 bg-purple-950/40 px-2.5 py-1.5 min-h-9.5"
                >
                  <button
                    type="button"
                    onClick={() => handleQuantityStep(-1)}
                    className="p-1 text-purple-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className="w-12 text-center text-sm font-bold text-white bg-transparent focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleQuantityStep(1)}
                    className="p-1 text-purple-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 active:scale-95 cursor-pointer transition-all min-h-9.5"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </button>
              )}

              <button
                type="button"
                onClick={handleInstantOrder}
                className="flex items-center justify-center gap-1 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 shadow-md shadow-pink-950/40 active:scale-95 cursor-pointer transition-all shrink-0 min-h-9.5"
                title="Instant Order"
              >
                <Zap className="h-3.5 w-3.5 fill-current text-pink-200" />
                Buy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}