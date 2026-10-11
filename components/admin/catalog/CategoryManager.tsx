"use client";

import { Check, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";

type CategoryManagerProps = {
  categories: Category[];
  onCreateCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: number, name: string) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
};

export default function CategoryManager({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await onCreateCategory(newCategoryName.trim());
    setNewCategoryName("");
  };

  const handleUpdate = async (id: number) => {
    await onUpdateCategory(id, editCategoryName.trim());
    setEditingCategoryId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await onDeleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          required
          placeholder="New Category Name..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer"
        >
          Add Category
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => {
          const linkedCount = cat.productCategories?.length ?? 0;

          return (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/60"
            >
              {editingCategoryId === cat.id ? (
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <input
                    type="text"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingCategoryId(null)}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-semibold text-white">{cat.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                      {linkedCount} {linkedCount === 1 ? "product" : "products"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCategoryId(cat.id);
                        setEditCategoryName(cat.name);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Delete Category</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <strong className="text-white">{deletingCategory.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
