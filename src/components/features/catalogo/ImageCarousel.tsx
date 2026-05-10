"use client";

import { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageList = images.length > 0 ? images.slice(0, 5) : ["/placeholder.png"];
  const total = imageList.length;

  const goPrevious = () => {
    setActiveIndex((current) => (current === 0 ? total - 1 : current - 1));
  };

  const goNext = () => {
    setActiveIndex((current) => (current === total - 1 ? 0 : current + 1));
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100 shadow-sm">
        <img
          src={imageList[activeIndex]}
          alt={`${alt} imagen ${activeIndex + 1}`}
          className="h-[480px] w-full object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Imagen anterior"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-700 shadow transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Imagen siguiente"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-700 shadow transition hover:bg-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {imageList.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`overflow-hidden rounded-3xl border transition duration-150 ${
                index === activeIndex
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : "border-slate-200 hover:border-slate-400"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img
                src={image}
                alt={`${alt} miniatura ${index + 1}`}
                className="h-20 w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
