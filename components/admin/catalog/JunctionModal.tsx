"use client";

import { Check, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { toast } from "react-hot-toast";

type JunctionModalProps = {
  product: Product | null;
  categories: Category[];
  images: Image[];
  onClose: () => void;
  onToggleCategory: (productId: number, categoryId: number, isAttached: boolean) => Promise<void>;
  onToggleImage: (productId: number, imageId: number, isAttached: boolean) => Promise<void>;
  onUploadAndAttachImage?: (productId: number, file: File) => Promise<void>;
  onCreateAndAttachCategory?: (productId: number, name: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export default function JunctionModal({
  product,
  categories,
  images,
  onClose,
  onToggleCategory,
  onToggleImage,
  onUploadAndAttachImage,
  onCreateAndAttachCategory,
}: JunctionModalProps) {
  const [transitioningCatId, setTransitioningCatId] = useState<number | null>(null);
  const [transitioningImgId, setTransitioningImgId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Inline category creation state
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  if (!product) return null;

  const handleCategoryToggle = async (catId: number, isAttached: boolean) => {
    setTransitioningCatId(catId);
    try {
      await onToggleCategory(product.id, catId, isAttached);
      toast.success(isAttached ? "Category detached" : "Category attached");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setTransitioningCatId(null);
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !onCreateAndAttachCategory) return;

    setIsCreatingCat(true);
    try {
      await onCreateAndAttachCategory(product.id, newCatName.trim());
      toast.success(`Category "${newCatName.trim()}" created and attached`);
      setNewCatName("");
      setShowCatInput(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleImageToggle = async (imgId: number, isAttached: boolean) => {
    setTransitioningImgId(imgId);
    try {
      await onToggleImage(product.id, imgId, isAttached);
      toast.success(isAttached ? "Image detached" : "Image attached");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setTransitioningImgId(null);
    }
  };

  const handleFileUploadAndAttach = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadAndAttachImage) return;

    setIsUploading(true);
    try {
      await onUploadAndAttachImage(product.id, file);
      toast.success("Image uploaded and attached");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">{product.name}</h3>
            <p className="text-xs text-slate-400">Manage category links and media gallery</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Categories</h4>

            {onCreateAndAttachCategory && (
              <button
                onClick={() => setShowCatInput(!showCatInput)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 border border-purple-500 text-white hover:bg-purple-500 text-xs font-semibold transition-all cursor-pointer shadow-md shadow-purple-900/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Category</span>
              </button>
            )}
          </div>

          {/* Inline Create Category Input */}
          {showCatInput && (
            <form onSubmit={handleCreateCategorySubmit} className="flex gap-2 mb-3">
              <input
                type="text"
                required
                autoFocus
                placeholder="Category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isCreatingCat || !newCatName.trim()}
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 cursor-pointer disabled:opacity-50"
              >
                {isCreatingCat ? "Creating..." : "Save & Attach"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCatInput(false);
                  setNewCatName("");
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isAttached = product.categories?.some((c) => c.id === cat.id);
              const isTransitioning = transitioningCatId === cat.id;

              return (
                <button
                  key={cat.id}
                  disabled={isTransitioning}
                  onClick={() => handleCategoryToggle(cat.id, !!isAttached)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isTransitioning
                      ? "border-amber-500/60 bg-amber-500/10 text-amber-300 animate-pulse"
                      : isAttached
                      ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/30"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {isAttached ? <Check className="h-3 w-3" /> : <span>+</span>}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Attachments Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Media Gallery</h4>

            {onUploadAndAttachImage && (
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 border border-purple-500 text-white hover:bg-purple-500 text-xs font-semibold transition-all cursor-pointer shadow-md shadow-purple-900/20">
                <Upload className="h-3.5 w-3.5" />
                <span>{isUploading ? "Uploading..." : "Upload New Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleFileUploadAndAttach}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {images.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No media assets in library yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img) => {
                const isAttached = product.images?.some((i) => i.id === img.id);
                const isTransitioning = transitioningImgId === img.id;
                const srcUrl = img.url || img.path;

                return (
                  <div
                    key={img.id}
                    onClick={() => !isTransitioning && handleImageToggle(img.id, !!isAttached)}
                    className={`relative h-24 rounded-xl border overflow-hidden cursor-pointer transition-all ${
                      isTransitioning
                        ? "border-amber-500 ring-2 ring-amber-500/40 opacity-80 animate-pulse"
                        : isAttached
                        ? "ring-2 ring-purple-500 border-transparent opacity-100 shadow-md shadow-purple-900/30"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {srcUrl ? (
                      <Image src={srcUrl} alt={img.name || "Media"} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-600">
                        No Image
                      </div>
                    )}

                    {isAttached && !isTransitioning && (
                      <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-purple-600 text-white shadow-md">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-1.5 py-0.5 text-[9px] text-slate-300 truncate">
                      {img.name || "Untitled"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
