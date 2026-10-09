"use client";

import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type ProductImage = { id?: number; url: string };

export default function ProductGallery({
  images,
  title,
}: {
  images: ProductImage[];
  title: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-500">
        <Camera className="h-16 w-16 opacity-40" />
      </div>
    );
  }

  const activeImage = images[selectedIndex];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-900/80 shadow-2xl shadow-purple-950/30">
        <Image
          src={activeImage.url}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-all duration-500 scale-100"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-purple-500/30 bg-slate-950/70 p-2 text-white backdrop-blur-md hover:bg-purple-900/50 transition-all"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-purple-500/30 bg-slate-950/70 p-2 text-white backdrop-blur-md hover:bg-purple-900/50 transition-all"
              aria-label="Next Image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md md:hidden">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === selectedIndex
                    ? "w-5 bg-pink-500"
                    : "w-2 bg-slate-600 opacity-60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="hidden md:flex items-center justify-center gap-3 overflow-x-auto py-2">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                type="button"
                className={`relative aspect-square w-20 overflow-hidden rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? "border-pink-500 ring-2 ring-pink-500/30 scale-105 shadow-lg shadow-pink-950/50"
                    : "border-slate-800 opacity-60 hover:opacity-100 hover:border-purple-500/40"
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
