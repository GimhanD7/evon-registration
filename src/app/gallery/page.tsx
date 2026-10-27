"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  ArrowLeft,
  Search,
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  BookOpen,
  Award,
  Users,
  Layers,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JoinModal from "@/components/JoinModal";
import StudentLoginModal from "@/components/StudentLoginModal";
import StudentVideoTestimonials from "@/components/StudentVideoTestimonials";
import { galleryPhotos, featuredPhotos, GalleryPhoto } from "@/data/galleryData";

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "classroom" | "paper" | "awards"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );

  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Filter and sort photos (default sort is latest first!)
  const processedPhotos = useMemo(() => {
    let result = [...galleryPhotos];

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort order (latest first or oldest first)
    if (sortOrder === "latest") {
      result.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      result.sort((a, b) => a.timestamp - b.timestamp);
    }

    return result;
  }, [selectedCategory, searchQuery, sortOrder]);

  const openLightbox = (indexInProcessed: number) => {
    const target = processedPhotos[indexInProcessed];
    const originalIndex = galleryPhotos.findIndex((p) => p.id === target.id);
    setSelectedPhotoIndex(originalIndex !== -1 ? originalIndex : 0);
  };

  const openLightboxByPhoto = (photo: GalleryPhoto) => {
    const originalIndex = galleryPhotos.findIndex((p) => p.id === photo.id);
    setSelectedPhotoIndex(originalIndex !== -1 ? originalIndex : 0);
  };

  const heroSpotlightPhoto = featuredPhotos[0] || galleryPhotos[0];
  const heroAccentPhoto1 = featuredPhotos[1] || galleryPhotos[1];
  const heroAccentPhoto2 = featuredPhotos[2] || galleryPhotos[2];

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
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Navigation Header */}
      <Header
        onOpenJoin={() => setIsJoinOpen(true)}
      />

      {/* Modern Themed Hero Header */}
      <section className="relative isolate -mt-[88px] overflow-hidden bg-[linear-gradient(135deg,#061a2c_0%,#0c253d_45%,#08385e_100%)] pt-[155px] pb-20 text-white max-lg:pt-[135px] max-lg:pb-16 max-md:mt-0 max-md:pt-10 max-md:pb-14">
        {/* Glow Ambient Orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 size-[550px] rounded-full bg-[#007fb8]/30 blur-[130px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 -right-40 size-[550px] rounded-full bg-[#0ac9e8]/25 blur-[140px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 size-[400px] rounded-full bg-[#38d995]/15 blur-[120px]"
        />

        {/* Brand Geometric Polygon Accents (Signature Theme Design) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[52%] bg-[#007fba]/15 [clip-path:polygon(28%_0,100%_0,100%_100%,45%_100%,0_32%)] max-lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -right-6 w-[48%] bg-[linear-gradient(160deg,#007fba_0%,#00acd4_50%,#008dc4_100%)]/20 [clip-path:polygon(25%_0,100%_0,100%_100%,0_100%)] max-lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-40 w-32 bg-[#38d995]/10 [clip-path:polygon(0_0,100%_100%,0_100%)] max-lg:hidden"
        />

        {/* Subtle Grid Pattern Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1240px] px-8 max-sm:px-4">
          {/* Top Breadcrumb & Badge Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[12px] font-bold text-white/80">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft size={13} className="text-[#38d995]" /> Back to Home
              </Link>
              <span className="text-white/40">/</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0ac9e8]/30 bg-[#0ac9e8]/10 px-3 py-1.5 text-[#0ac9e8] backdrop-blur-md">
                <Camera size={13} /> Photo Gallery
              </span>
            </div>

            {/* Quick Batch Pill */}
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold tracking-wider uppercase text-white/90 backdrop-blur-md">
              <Sparkles size={12} className="text-[#38d995]" /> 2026 / 2027 O/L Commerce Batches
            </div>
          </div>

          {/* Main 2-Column Hero Grid */}
          <div className="grid grid-cols-12 items-center gap-8 lg:gap-12">
            {/* Left Column: Heading, Story, CTA & Metrics (7 cols on desktop) */}
            <div className="col-span-12 lg:col-span-7">
              {/* Live Status Pill Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#38d995]/30 bg-[#38d995]/15 px-4 py-1.5 text-[11px] font-extrabold tracking-[1.8px] uppercase text-[#a6f4ce] backdrop-blur-md">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38d995] opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-[#38d995]"></span>
                </span>
                Official Classroom Archive • {galleryPhotos.length}+ Photos
              </div>

              {/* Main Headline */}
              <h1 className="mt-4 text-[clamp(34px,4.2vw,56px)] leading-[1.06] font-black tracking-[-2px] text-white">
                Inside Our Classrooms: <br />
                <span className="bg-[linear-gradient(135deg,#38d995_0%,#0ac9e8_50%,#ffffff_100%)] bg-clip-text text-transparent">
                  Real Classes, Real Energy
                </span>
              </h1>

              {/* Tagline / Subtitle */}
              <div className="mt-4 flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-10 shrink-0 bg-[#00acd4]" />
                <p className="text-[12px] font-extrabold tracking-[2.4px] text-[#0ac9e8] uppercase max-sm:text-[10px] max-sm:tracking-[1.6px]">
                  Winners take it all... and Stand above all...
                </p>
              </div>

              {/* Paragraph */}
              <p className="mt-4 max-w-[580px] text-[15px] leading-[1.75] font-medium text-[#d0e5f2] max-sm:text-[13.5px]">
                Explore genuine, unedited moments from our physical lecture halls, weekly model paper classes, and student award ceremonies conducted by <strong>Evon Aravinda</strong> across leading institutes in Sri Lanka.
              </p>

              {/* CTA Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsJoinOpen(true)}
                  className="group inline-flex items-center justify-between gap-4 rounded-full bg-[#007fb8] py-1.5 pr-1.5 pl-6 text-[13px] font-bold text-white shadow-lg shadow-[#007fb8]/35 transition-all hover:bg-[#006ca0] hover:scale-102 cursor-pointer"
                >
                  Join Next Class
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={18} strokeWidth={2.5} />
                  </span>
                </button>

                <a
                  href="#gallery-grid"
                  className="group inline-flex items-center justify-between gap-4 rounded-full border border-white/30 bg-white/10 py-1.5 pr-1.5 pl-6 text-[13px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 cursor-pointer"
                >
                  Explore Photos
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/20 text-[#38d995] transition-transform group-hover:translate-y-0.5">
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </span>
                </a>
              </div>

              {/* 4 Frosted Stat Cards */}
              <div className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[620px]">
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15 hover:border-white/25 shadow-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#38d995] uppercase tracking-wider">
                    <Layers size={13} /> Archived
                  </div>
                  <div className="mt-1 text-[22px] font-black text-white">{galleryPhotos.length}+</div>
                  <div className="text-[10px] text-white/70 font-semibold">Genuine Photos</div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15 hover:border-white/25 shadow-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0ac9e8] uppercase tracking-wider">
                    <BookOpen size={13} /> Institutes
                  </div>
                  <div className="mt-1 text-[22px] font-black text-white">8</div>
                  <div className="text-[10px] text-white/70 font-semibold">Physical Halls</div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15 hover:border-white/25 shadow-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#fde047] uppercase tracking-wider">
                    <Award size={13} /> Achievers
                  </div>
                  <div className="mt-1 text-[22px] font-black text-white">100%</div>
                  <div className="text-[10px] text-white/70 font-semibold">Exam Focused</div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15 hover:border-white/25 shadow-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#a6f4ce] uppercase tracking-wider">
                    <Users size={13} /> Students
                  </div>
                  <div className="mt-1 text-[22px] font-black text-white">2.5K+</div>
                  <div className="text-[10px] text-white/70 font-semibold">Guided Annually</div>
                </div>
              </div>
            </div>

            {/* Right Column: Layered 3D-Tilted Photo Showcase (5 cols on desktop) */}
            <div className="col-span-12 lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-[440px] sm:max-w-[480px] py-4">
                {/* Ambient Glow Halo behind photos */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#007fb8]/40 via-[#0ac9e8]/30 to-[#38d995]/20 blur-2xl -z-10"
                />

                {/* Back Tilted Card 1: Top-Right (Awards Ceremony) */}
                {heroAccentPhoto1 && (
                  <div
                    onClick={() => openLightboxByPhoto(heroAccentPhoto1)}
                    className="absolute -top-4 -right-2 sm:-right-4 w-[68%] sm:w-[65%] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/20 bg-[#102c45] shadow-2xl rotate-6 transition-all duration-300 hover:rotate-2 hover:scale-105 hover:z-30 cursor-pointer group"
                    title="Click to view full photo"
                  >
                    <Image
                      src={heroAccentPhoto1.src}
                      alt={heroAccentPhoto1.alt}
                      fill
                      sizes="(max-width: 640px) 250px, 320px"
                      className="object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[9px] font-extrabold text-[#fde047] uppercase">
                        <Award size={10} /> Awards
                      </span>
                    </div>
                  </div>
                )}

                {/* Back Tilted Card 2: Bottom-Left (Paper Class Drill) */}
                {heroAccentPhoto2 && (
                  <div
                    onClick={() => openLightboxByPhoto(heroAccentPhoto2)}
                    className="absolute -bottom-4 -left-2 sm:-left-4 w-[64%] sm:w-[60%] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/20 bg-[#102c45] shadow-2xl -rotate-6 transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-30 cursor-pointer group"
                    title="Click to view full photo"
                  >
                    <Image
                      src={heroAccentPhoto2.src}
                      alt={heroAccentPhoto2.alt}
                      fill
                      sizes="(max-width: 640px) 240px, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[9px] font-extrabold text-[#0ac9e8] uppercase">
                        <BookOpen size={10} /> Paper Class
                      </span>
                    </div>
                  </div>
                )}

                {/* Main Foreground Spotlight Card */}
                {heroSpotlightPhoto && (
                  <div
                    onClick={() => openLightboxByPhoto(heroSpotlightPhoto)}
                    className="relative z-20 aspect-[16/11] w-[88%] sm:w-[86%] mx-auto rounded-2xl overflow-hidden border-2 border-white/40 bg-[#102c45] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-300 hover:scale-102 hover:border-white/70 cursor-pointer group"
                    title="Click to view full photo"
                  >
                    <Image
                      src={heroSpotlightPhoto.src}
                      alt={heroSpotlightPhoto.alt}
                      fill
                      priority
                      sizes="(max-width: 640px) 350px, 450px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071e33] via-[#071e33]/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/25 px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">
                        <Camera size={11} className="text-[#38d995]" /> Classroom Session
                      </span>
                      <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100">
                        <Maximize2 size={13} />
                      </span>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-[13px] font-black text-white leading-tight">
                        {heroSpotlightPhoto.title}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-white/80">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-[#0ac9e8]" /> Rotary Hall, Nugegoda
                        </span>
                        <span className="font-bold text-[#38d995]">Click to preview</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Glass Pill Badge (Bottom-Right) */}
                <div className="absolute -bottom-3 right-2 sm:right-0 z-30 flex items-center gap-2.5 rounded-full border border-white/30 bg-[#071e33]/90 px-4 py-2 text-[11px] font-extrabold text-white shadow-2xl backdrop-blur-xl">
                  <span className="flex size-2 rounded-full bg-[#38d995] animate-pulse" />
                  <span>Real Classes • Real Results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter, Search & Controls Section */}
      <section
        id="gallery-grid"
        className="sticky top-[84px] max-md:top-0 z-30 border-b border-[#cbd5e1] bg-white/95 px-8 py-3.5 backdrop-blur-md shadow-xs max-sm:px-4"
      >
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-3.5">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Photos", count: galleryPhotos.length, icon: Layers },
              {
                id: "classroom",
                label: "Classroom Sessions",
                count: galleryPhotos.filter((p) => p.category === "classroom").length,
                icon: Users,
              },
              {
                id: "paper",
                label: "Paper Classes",
                count: galleryPhotos.filter((p) => p.category === "paper").length,
                icon: BookOpen,
              },
              {
                id: "awards",
                label: "Student Awards",
                count: galleryPhotos.filter((p) => p.category === "awards").length,
                icon: Award,
              },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id as typeof selectedCategory)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-extrabold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#102c45] text-white shadow-md shadow-[#102c45]/25 scale-102"
                      : "bg-[#f1f5f9] text-[#60768a] hover:bg-[#e2e8f0] hover:text-[#102c45]"
                  }`}
                >
                  <TabIcon size={13} className={isActive ? "text-[#38d995]" : "text-[#94a3b8]"} />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      isActive ? "bg-white/20 text-white" : "bg-black/5 text-[#60768a]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5 max-sm:w-full">
            {/* Search Input */}
            <div className="relative max-sm:w-full">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                type="text"
                placeholder="Search by topic, tag, or institute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[240px] max-sm:w-full rounded-full border border-[#cbd5e1] bg-white py-2 pr-8 pl-9 text-[12px] font-semibold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:outline-none focus:ring-2 focus:ring-[#007fb8]/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#102c45] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort Toggle (Latest first / Oldest first) */}
            <button
              type="button"
              onClick={() =>
                setSortOrder(sortOrder === "latest" ? "oldest" : "latest")
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-[12px] font-bold text-[#102c45] shadow-xs transition-colors hover:border-[#007fb8] hover:text-[#007fb8] cursor-pointer"
            >
              <ArrowUpDown size={13} className="text-[#007fb8]" />
              <span>
                {sortOrder === "latest" ? "Latest First" : "Oldest First"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Photos Grid Section */}
      <section className="py-14">
        <div className="mx-auto w-full max-w-[1200px] px-8 max-sm:px-4">
          {/* Result Count */}
          <div className="mb-6 flex items-center justify-between text-[13px] font-bold text-[#60768a]">
            <span>
              Showing {processedPhotos.length} of {galleryPhotos.length} photos
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#007fb8] hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Grid */}
          {processedPhotos.length === 0 ? (
            <div className="rounded-3xl border border-[#cbd5e1] bg-white p-12 text-center">
              <Camera size={40} className="mx-auto text-[#cbd5e1]" />
              <h3 className="mt-4 text-[18px] font-bold text-[#102c45]">
                No photos found
              </h3>
              <p className="mt-1 text-[13px] text-[#60768a]">
                Try adjusting your search query or switching categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#102c45] px-5 py-2 text-[12px] font-bold text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
              {processedPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(idx)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#cddce5] bg-[#102c45] shadow-xs transition-all duration-300 hover:border-[#007fb8] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  <div className="relative h-[230px] w-full overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102c45] via-[#102c45]/25 to-transparent opacity-75 transition-opacity group-hover:opacity-95" />

                    {/* Top Tag Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/25 backdrop-blur-md px-2 py-0.5 text-[9.5px] font-black text-white uppercase tracking-wider border border-white/30">
                        <Sparkles size={10} className="text-[#38d995]" /> {photo.tag}
                      </span>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <h3 className="text-[14px] font-black text-white leading-tight line-clamp-1">
                        {photo.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-white/80 line-clamp-1">
                        {photo.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10.5px] font-bold text-[#38d995]">
                        <Maximize2 size={11} /> View full photo
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/92 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex flex-col max-h-[94vh] max-w-[1050px] w-full overflow-hidden rounded-3xl border border-white/20 bg-[#0f172a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#007fb8] px-3 py-0.5 text-[11px] font-extrabold text-white uppercase tracking-wider">
                  {galleryPhotos[selectedPhotoIndex].tag}
                </span>
                <span className="text-[14px] font-bold text-white/95 truncate max-sm:max-w-[180px]">
                  {galleryPhotos[selectedPhotoIndex].title}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px] font-bold text-white/70">
                  {selectedPhotoIndex + 1} of {galleryPhotos.length}
                </span>
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
            <div className="relative h-[70vh] max-sm:h-[50vh] w-full bg-black/60">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black cursor-pointer shadow-lg"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black cursor-pointer shadow-lg"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Photo Caption Footer */}
            <div className="border-t border-white/10 bg-[#0f172a] px-6 py-4 flex items-center justify-between gap-4">
              <p className="text-[13px] leading-relaxed text-white/80 truncate">
                {galleryPhotos[selectedPhotoIndex].description}
              </p>
              <div className="shrink-0 text-[11px] font-semibold text-[#0ac9e8]">
                Keyboard &larr; &rarr; to navigate • Esc to close
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentic Classroom Videos Section */}
      <StudentVideoTestimonials onOpenJoin={() => setIsJoinOpen(true)} />

      {/* Bottom Enrollment Banner */}
      <section className="bg-[#edf2f3] py-16 border-t border-[#cddce5]">
        <div className="mx-auto max-w-[800px] px-8 text-center max-sm:px-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3.5 py-1 text-[11px] font-extrabold text-[#0284c7] uppercase">
            <Sparkles size={13} /> Batch Admissions Open
          </div>
          <h2 className="mt-3 text-[28px] font-black text-[#102c45] max-sm:text-[22px]">
            Ready to Join Our Physical or Online Classes?
          </h2>
          <p className="mt-2 text-[14px] text-[#60768a]">
            Reserve your seat across 8 premier educational institutes or join our islandwide Zoom batch today.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsJoinOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#007fb8_0%,#005d8f_100%)] px-8 py-3.5 text-[14px] font-extrabold text-white shadow-lg shadow-[#007fb8]/30 transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              Enroll in Next Batch <ArrowRight size={16} />
            </button>
            <Link
              href="/#timetable"
              className="inline-flex items-center gap-2 rounded-full border border-[#cbd5e1] bg-white px-7 py-3.5 text-[14px] font-extrabold text-[#102c45] shadow-xs transition-colors hover:border-[#007fb8] hover:text-[#007fb8]"
            >
              View Class Timetable
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
      />

      {/* Modals */}
      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
      <StudentLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </main>
  );
}
