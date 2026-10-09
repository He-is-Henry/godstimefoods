"use client";

import { Camera, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  product: Product;
  setCategory: (categoryId: number) => void;
};

export default function ProductCard({ product, setCategory }: Props) {
  const router = useRouter();

  const isOutOfStock =
    !product.isAvailable ||
    (product.availableQuantity !== null && product.availableQuantity <= 0);

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
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
                className="rounded-md bg-purple-950/50 border border-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-300 hover:border-pink-500/40 hover:text-white transition-all z-10"
              >
                {c.name}
              </button>
            ))}
          </div>

          <h3 className="line-clamp-1 text-base font-semibold text-white group-hover:text-pink-400 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-medium text-slate-400">
              Price
            </span>
            <span className="text-base font-bold text-white">
              ₦{product.price.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all ${
              isOutOfStock
                ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-pink-500/20 active:scale-95 cursor-pointer"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isOutOfStock ? "Unavailable" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
