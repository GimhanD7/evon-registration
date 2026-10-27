"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { featuredPhotos, galleryPhotos } from "@/data/galleryData";

// Always show exactly 6 curated photos on the homepage
const HOME_PHOTOS = featuredPhotos.slice(0, 6);

export default function ClassGallery() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openLightbox = (indexInHome: number) => {
    const target = HOME_PHOTOS[indexInHome];
    const originalIndex = galleryPhotos.findIndex((p) => p.id === target.id);
    setSelectedPhotoIndex(originalIndex !== -1 ? originalIndex : 0);
  };

  const closeLightbox = () => setSelectedPhotoIndex(null);

  const showNext = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % galleryPhotos.length);
  }, [selectedPhotoIndex]);

  const showPrev = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(
      (selectedPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length
    );
  }, [selectedPhotoIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, showNext, showPrev]);

  return (
    <section id="gallery" className="relative bg-[#f8fafc] py-24 max-lg:py-16 overflow-hidden">
      {/* Background Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 -z-10 size-[500px] rounded-full bg-[#007fb8]/5 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 -left-40 -z-10 size-[500px] rounded-full bg-[#0ac9e8]/5 blur-[120px]"
      />

      <div className="mx-auto w-full max-w-[1200px] px-8 max-sm:px-4">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007fb8]/20 bg-[#007fb8]/10 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[1.5px] text-[#007fb8] uppercase">
            <Camera size={13} /> Inside Our Classrooms
          </div>
          <h2 className="mt-4 text-[clamp(28px,3.4vw,44px)] leading-[1.12] font-black tracking-[-1.2px] text-[#102c45]">
            Life at Access to Success: <br />
            <span className="text-[#007fb8]">Real Classes, Real Energy</span>
          </h2>
          <p className="mt-3 max-w-[700px] text-[15px] leading-[1.65] font-medium text-[#60768a] max-sm:text-[13px]">
            Step inside our physical lecture halls and paper discussion sessions across Sri Lanka. Experience the dedication, energy, and peer community guided by <strong>Evon Aravinda</strong>.
          </p>
        </div>

        {/* 6 Photos Grid (Always exactly 6 on Homepage) */}
        <div className="mt-12 grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {HOME_PHOTOS.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(idx)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#cddce5] bg-[#102c45] shadow-sm transition-all duration-300 hover:border-[#007fb8] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative h-[255px] w-full overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#102c45] via-[#102c45]/30 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />

                {/* Top Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider border border-white/30">
                    <Sparkles size={11} className="text-[#38d995]" /> {photo.tag}
                  </span>
                </div>

                {/* Bottom Overlay Content */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                  <h3 className="text-[15px] font-black text-white leading-snug line-clamp-1">
                    {photo.title}
                  </h3>
                  <p className="mt-0.5 text-[11.5px] text-white/80 line-clamp-1">
                    {photo.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#38d995]">
                    <Maximize2 size={12} /> Expand photo
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button (Redirects to /gallery) */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3">
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-8 py-4 text-[14px] font-black text-white shadow-lg shadow-[#007fb8]/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#007fb8]/35 active:scale-95"
          >
            <Layers size={18} className="text-[#38d995]" />
            <span>View All Classroom Photos ({galleryPhotos.length}+)</span>
            <span className="flex size-7 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
              <ArrowRight size={15} />
            </span>
          </Link>
          <p className="text-[12px] font-semibold text-[#60768a]">
            Explore all {galleryPhotos.length}+ photos in our high-definition gallery archive
          </p>
        </div>
      </div>

      {/* High-Res Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex flex-col max-h-[94vh] max-w-[1000px] w-full overflow-hidden rounded-3xl border border-white/20 bg-[#0f172a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="rounded-full bg-[#007fb8] px-3 py-0.5 text-[11px] font-extrabold text-white uppercase tracking-wider">
                  {galleryPhotos[selectedPhotoIndex].tag}
                </span>
                <span className="text-[13px] font-bold text-white/90 truncate max-sm:max-w-[180px]">
                  {galleryPhotos[selectedPhotoIndex].title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11.5px] font-bold text-white/60">
                  {selectedPhotoIndex + 1} / {galleryPhotos.length}
                </span>
                <Link
                  href="/gallery"
                  onClick={closeLightbox}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
                >
                  All Photos <ArrowUpRight size={12} />
                </Link>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
                  aria-label="Close photo preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Photo View */}
            <div className="relative h-[68vh] max-sm:h-[48vh] w-full bg-black/50">
              <Image
                src={galleryPhotos[selectedPhotoIndex].src}
                alt={galleryPhotos[selectedPhotoIndex].alt}
                fill
                priority
                className="object-contain"
              />

              {/* Prev / Next Controls */}
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Photo Caption Footer */}
            <div className="border-t border-white/10 bg-[#0f172a] px-6 py-3.5 flex items-center justify-between gap-4">
              <p className="text-[12.5px] leading-relaxed text-white/80 truncate">
                {galleryPhotos[selectedPhotoIndex].description}
              </p>
              <div className="shrink-0 text-[11px] font-semibold text-[#0ac9e8]">
                Press &larr; &rarr; to navigate
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
