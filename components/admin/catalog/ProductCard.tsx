"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => Promise<void>;
  onManageJunctions: (product: Product) => void;
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onManageJunctions,
}: ProductCardProps) {
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const primaryImage = product.images?.[0]?.url || product.images?.[0]?.path;

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(product.id);
      setIsDeletingModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
      <div>
        <div className="relative h-40 w-full rounded-xl bg-slate-950 overflow-hidden mb-3 border border-slate-800">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-600 text-xs">
              No Image
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-white text-sm">{product.name}</h3>
          <span className="text-xs font-bold text-purple-400">₦{product.price.toLocaleString()}</span>
        </div>

        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          {product.description || "No description provided."}
        </p>

        <div className="flex flex-wrap gap-1 mt-3">
          {product.categories?.map((cat) => (
            <span
              key={cat.id}
              className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-500/20 text-[10px] text-purple-300"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => onManageJunctions(product)}
          className="text-xs font-semibold text-purple-400 hover:underline cursor-pointer"
        >
          Media & Categories
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-300 hover:text-white cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => setIsDeletingModalOpen(true)}
            className="p-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-red-400 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeletingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Delete Product</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <strong className="text-white">{product.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeletingModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
