"use client";

import { type CreateProductData } from "@/lib/products";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

type ProductModalProps = {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (data: CreateProductData) => Promise<void>;
};

export default function ProductModal({
  isOpen,
  editingProduct,
  onClose,
  onSave,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [availableQuantity, setAvailableQuantity] = useState<number | "">("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description || "");
      setPrice(editingProduct.price ?? "");
      setAvailableQuantity(editingProduct.availableQuantity ?? "");
      setIsAvailable(editingProduct.isAvailable ?? true);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setAvailableQuantity("");
      setIsAvailable(true);
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price === "") return;

    setSaving(true);
    try {
      await onSave({
        name,
        description: description.trim() || undefined,
        price: Number(price),
        availableQuantity: availableQuantity === "" ? undefined : Number(availableQuantity),
        isAvailable,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">
            {editingProduct ? "Edit Product" : "Create New Product"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Product Name <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Yam Flour"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Provide details about the product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Price (₦) <span className="text-purple-400">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                placeholder="e.g. 2500"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Available Stock
              </label>
              <input
                type="number"
                min={0}
                placeholder="Unlimited"
                value={availableQuantity}
                onChange={(e) =>
                  setAvailableQuantity(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="isAvailable" className="text-xs font-medium text-slate-300 cursor-pointer">
              Listed for sale on store
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
