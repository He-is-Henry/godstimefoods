"use client";

import { Edit2, Loader2, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

type MediaLibraryProps = {
  images: Image[];
  onUploadImage: (file: File, name?: string) => Promise<void>;
  onUpdateImageName: (id: number, name: string) => Promise<void>;
  onDeleteImage: (id: number) => Promise<void>;
};

export default function MediaLibrary({
  images,
  onUploadImage,
  onUpdateImageName,
  onDeleteImage,
}: MediaLibraryProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [uploading, setUploading] = useState(false);

  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [editName, setEditName] = useState("");
  const [updating, setUpdating] = useState(false);

  const [deletingImage, setDeletingImage] = useState<Image | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!customName) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setCustomName(fileNameWithoutExt);
    }
  };

  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      await onUploadImage(selectedFile, customName.trim() || undefined);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setCustomName("");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage || !editName.trim()) return;

    setUpdating(true);
    try {
      await onUpdateImageName(editingImage.id, editName.trim());
      setEditingImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingImage) return;

    setDeleting(true);
    try {
      await onDeleteImage(deletingImage.id);
      setDeletingImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Media Library</h2>
          <p className="text-xs text-slate-400">Manage uploaded images and media assets</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer"
        >
          <Upload className="h-4 w-4" /> Upload Image
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((img) => {
          const srcUrl = img.url || img.path;
          const linkedCount = img.productImages?.length ?? 0;

          return (
            <div
              key={img.id}
              className="group relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-32 w-full bg-slate-900">
                {srcUrl ? (
                  <Image src={srcUrl} alt={img.name || "Media"} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-slate-600">
                    No Image
                  </div>
                )}

                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-[9px] font-semibold text-purple-300 border border-purple-500/20">
                  {linkedCount} {linkedCount === 1 ? "product" : "products"}
                </div>

                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingImage(img);
                      setEditName(img.name || "");
                    }}
                    className="p-1 rounded-md bg-slate-900/80 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setDeletingImage(img)}
                    className="p-1 rounded-md bg-red-600/80 text-white cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="p-2 bg-slate-900/90 border-t border-slate-800/80">
                <p className="text-[11px] font-medium text-slate-200 truncate">{img.name || "Untitled"}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmUpload}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Upload New Image</h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Image File <span className="text-purple-400">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileSelect}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-950 file:text-purple-300 hover:file:bg-purple-900 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Image Name / Label</label>
              <input
                type="text"
                placeholder="e.g. Fresh Yam Banner"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {uploading ? "Uploading..." : "Upload Asset"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmRename}
            className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Edit Image Name</h3>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Name"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Delete Media Asset</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <strong className="text-white">{deletingImage.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingImage(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
