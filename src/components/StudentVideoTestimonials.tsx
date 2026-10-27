"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
  X,
  Volume2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Star,
  BookOpen,
  Layers,
  MapPin,
  ArrowRight,
} from "lucide-react";

export interface StudentVideoStory {
  id: string;
  name: string;
  school: string;
  achievement: string;
  category: "paper" | "accounting";
  batch: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  videoTitle: string;
  quote: string;
  fullTestimonial: string;
  scoreHighlight: string;
  keyTopics: string[];
}

const galleryVideoStories: StudentVideoStory[] = [
  {
    id: "gallery-video-1",
    name: "Model Paper Session #1",
    school: "Rotary Hall, Nugegoda",
    achievement: "Timed Exam Drill",
    category: "paper",
    batch: "2026/2027 O/L Commerce Batch",
    thumbnail: "/gallary/thumbnails/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM.jpg",
    videoUrl: "/gallary/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM.mp4",
    duration: "0:27 min",
    videoTitle: "Intensive Model Paper Drill & Timed Writing Practice",
    quote:
      "Simulating the exact 3-hour exam pressure every week. Students time every answer and master time management under strict exam hall conditions.",
    fullTestimonial:
      "Real footage from our weekend physical paper class. Students receive fresh model papers prepared directly according to the latest government syllabus and marking scheme. Every question is solved under strict exam conditions followed by comprehensive marking breakdown.",
    scoreHighlight: "Timed Mock Exam Drill",
    keyTopics: [
      "Strict physical exam hall simulation",
      "Paper time management coaching",
      "Real-time script review and marking guidance",
    ],
  },
  {
    id: "gallery-video-2",
    name: "Accounting Revision Batch",
    school: "Physical Hall Sessions",
    achievement: "Ledger Mastery",
    category: "accounting",
    batch: "2026/2027 O/L Commerce Batch",
    thumbnail: "/gallary/thumbnails/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%281%29.jpg",
    videoUrl: "/gallary/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%281%29.mp4",
    duration: "0:20 min",
    videoTitle: "Live Double-Entry Ledger Balancing & Problem Solving",
    quote:
      "Breaking down complex ledger adjustments so balancing accounts becomes second nature before the national examination.",
    fullTestimonial:
      "A live view inside the lecture hall during the Accounting practice module. Evon sir guides students through complex multi-column cash books, adjustments for depreciation, and balance sheet preparation with zero hesitation.",
    scoreHighlight: "Step-by-Step Ledger Mapping",
    keyTopics: [
      "Double-entry bookkeeping mastery",
      "Fast calculations without calculation anxiety",
      "Step-by-step transaction mapping framework",
    ],
  },
  {
    id: "gallery-video-3",
    name: "Accounting Precision Drill",
    school: "Rotary Hall, Nugegoda",
    achievement: "100/100 Format Accuracy",
    category: "accounting",
    batch: "2026/2027 O/L Commerce Batch",
    thumbnail: "/gallary/thumbnails/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%282%29.jpg",
    videoUrl: "/gallary/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%282%29.mp4",
    duration: "0:08 min",
    videoTitle: "Ruler & Pencil Precision: Perfection in Financial Statements",
    quote:
      "Every line, ledger heading, and double-underline counts toward 100/100 under official government examiner criteria.",
    fullTestimonial:
      "Detailed close-up observation of students working on their answer sheets. Examiner criteria penalize untidy formatting; here students build the discipline to produce immaculate ledger sheets that examiners award full marks for.",
    scoreHighlight: "Full Marks in Presentation",
    keyTopics: [
      "Official examiner formatting requirements",
      "Double-underline closing technique",
      "Maximizing presentation marks in Part II",
    ],
  },
  {
    id: "gallery-video-4",
    name: "Model Paper Desk Check",
    school: "Rotary Hall, Nugegoda",
    achievement: "Individual Feedback",
    category: "paper",
    batch: "2026/2027 O/L Commerce Batch",
    thumbnail: "/gallary/thumbnails/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%283%29.jpg",
    videoUrl: "/gallary/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%283%29.mp4",
    duration: "0:05 min",
    videoTitle: "Individual Script Check & Fast Answer Verification",
    quote:
      "Immediate error detection prevents students from carrying misconceptions into the national examination.",
    fullTestimonial:
      "In-class focused inspection of test sheets during trial paper sessions. Sir and the teaching team check each student's progress right at their desk, ensuring mistakes are corrected immediately.",
    scoreHighlight: "Real-Time Verification",
    keyTopics: [
      "Desk-side individual guidance",
      "Pinpointing common student pitfalls",
      "Instant answer verification",
    ],
  },
  {
    id: "gallery-video-5",
    name: "Speed & Accuracy Drill",
    school: "Apex / Rotary / Syzygy",
    achievement: "40/40 MCQ Strategy",
    category: "paper",
    batch: "2026/2027 O/L Commerce Batch",
    thumbnail: "/gallary/thumbnails/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%284%29.jpg",
    videoUrl: "/gallary/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%284%29.mp4",
    duration: "0:12 min",
    videoTitle: "Past Paper Target Questions & Timed MCQ Analysis",
    quote:
      "Scoring 40 out of 40 in Commerce Paper 1 requires elimination strategy and pattern recognition.",
    fullTestimonial:
      "Students working through targeted MCQ sets extracted from 25+ years of O/L Commerce past papers. This rigorous training ensures students complete Paper 1 in just 35 minutes with 100% accuracy.",
    scoreHighlight: "Fast MCQ Elimination",
    keyTopics: [
      "40/40 MCQ elimination strategies",
      "Pattern recognition for recurring questions",
      "Building exam speed and mental agility",
    ],
  },
  {
    id: "gallery-video-6",
    name: "Hall Environment Overview",
    school: "Rotary Hall, Nugegoda",
    achievement: "Zero Distractions",
    category: "accounting",
    batch: "2026/2027 O/L Commerce Batch",
    thumbnail: "/gallary/thumbnails/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%285%29.jpg",
    videoUrl: "/gallary/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%285%29.mp4",
    duration: "0:14 min",
    videoTitle: "Classroom Atmosphere & Focused Study Environment",
    quote:
      "Surrounded by ambitious peers striving for island ranks, every student stays motivated to excel.",
    fullTestimonial:
      "The full classroom view shows the serious, focused energy of our Commerce batches. Air-conditioned, modern halls equipped with clear audio-visual screens keep every student locked into learning.",
    scoreHighlight: "Peak Exam Concentration",
    keyTopics: [
      "High-energy peer motivation",
      "Modern, comfortable lecture facilities",
      "Zero distractions during paper drills",
    ],
  },
  {
    id: "gallery-video-7",
    name: "Full Paper Discussion",
    school: "Rotary Hall, Nugegoda",
    achievement: "Marking Scheme Review",
    category: "paper",
    batch: "2026/2027 O/L Commerce Batch",
    thumbnail: "/gallary/thumbnails/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%286%29.jpg",
    videoUrl: "/gallary/WhatsApp%20Video%202026-10-26%20at%201.06.45%20PM%20%286%29.mp4",
    duration: "0:28 min",
    videoTitle: "Comprehensive Paper Discussion & Whiteboard Breakdown",
    quote:
      "Step-by-step whiteboard explanation of every question, showing exactly how examiners assign marks.",
    fullTestimonial:
      "Detailed video of a full paper discussion session. Evon sir writes down the full model answer on the board, demonstrating the exact wording, keywords, and ledger layouts necessary to secure the highest marks.",
    scoreHighlight: "Official Marking Scheme",
    keyTopics: [
      "Official marking scheme keyword breakdown",
      "Structuring 10-mark and 20-mark business essay answers",
      "Complete past paper review and revision notes",
    ],
  },
];

interface StudentVideoTestimonialsProps {
  onOpenJoin: (courseName?: string) => void;
}

export default function StudentVideoTestimonials({
  onOpenJoin,
}: StudentVideoTestimonialsProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "paper" | "accounting">("all");
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredVideos = galleryVideoStories.filter((v) => {
    if (selectedCategory === "all") return true;
    return v.category === selectedCategory;
  });

  // Show 3 videos by default; show all when expanded
  const displayedVideos = showAll ? filteredVideos : filteredVideos.slice(0, 3);

  const activeStory = activeStoryIndex !== null ? galleryVideoStories[activeStoryIndex] : null;

  const openVideo = (story: StudentVideoStory) => {
    const idx = galleryVideoStories.findIndex((v) => v.id === story.id);
    setActiveStoryIndex(idx !== -1 ? idx : 0);
  };

  const closeVideo = () => {
    setActiveStoryIndex(null);
  };

  const showNextVideo = useCallback(() => {
    if (activeStoryIndex === null) return;
    setActiveStoryIndex((activeStoryIndex + 1) % galleryVideoStories.length);
  }, [activeStoryIndex]);

  const showPrevVideo = useCallback(() => {
    if (activeStoryIndex === null) return;
    setActiveStoryIndex(
      (activeStoryIndex - 1 + galleryVideoStories.length) % galleryVideoStories.length
    );
  }, [activeStoryIndex]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStoryIndex === null) return;
      if (e.key === "Escape") closeVideo();
      if (e.key === "ArrowRight") showNextVideo();
      if (e.key === "ArrowLeft") showPrevVideo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStoryIndex, showNextVideo, showPrevVideo]);

  return (
    <section id="student-videos" className="relative bg-[#ffffff] py-24 max-lg:py-16 overflow-hidden">
      {/* Background Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 size-[650px] rounded-full bg-[#d9edf4]/40 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 -z-10 size-[450px] rounded-full bg-[#0ac9e8]/5 blur-[120px]"
      />

      <div className="mx-auto w-full max-w-[1240px] px-8 max-sm:px-4">
        {/* Header (Preserving Exact Requested Section Title) */}
        <div className="mx-auto max-w-[760px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007fb8]/20 bg-[#007fb8]/10 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[1.5px] text-[#007fb8] uppercase">
            <Sparkles size={13} className="text-[#38d995]" /> Official Classroom Video Archive
          </div>
          <h2 className="mt-4 text-[clamp(28px,3.4vw,44px)] leading-[1.12] font-black tracking-[-1.2px] text-[#102c45]">
            Hear It Directly: <br />
            <span className="text-[#007fb8]">Real Students, Real Success Stories</span>
          </h2>
          <p className="mt-3 text-[15px] leading-[1.65] font-medium text-[#60768a] max-sm:text-[13px]">
            Watch authentic video footage from our physical lecture halls and model paper drill sessions conducted by <strong>Evon Aravinda</strong> across Sri Lanka.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-4 py-2 text-[12px] font-extrabold transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#102c45] text-white shadow-md shadow-[#102c45]/20 scale-102"
                  : "bg-[#f1f5f9] text-[#60768a] hover:bg-[#e2e8f0] hover:text-[#102c45]"
              }`}
            >
              All Classroom Videos ({galleryVideoStories.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("paper")}
              className={`rounded-full px-4 py-2 text-[12px] font-extrabold transition-all cursor-pointer ${
                selectedCategory === "paper"
                  ? "bg-[#102c45] text-white shadow-md shadow-[#102c45]/20 scale-102"
                  : "bg-[#f1f5f9] text-[#60768a] hover:bg-[#e2e8f0] hover:text-[#102c45]"
              }`}
            >
              Model Paper Drills ({galleryVideoStories.filter((v) => v.category === "paper").length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("accounting")}
              className={`rounded-full px-4 py-2 text-[12px] font-extrabold transition-all cursor-pointer ${
                selectedCategory === "accounting"
                  ? "bg-[#102c45] text-white shadow-md shadow-[#102c45]/20 scale-102"
                  : "bg-[#f1f5f9] text-[#60768a] hover:bg-[#e2e8f0] hover:text-[#102c45]"
              }`}
            >
              Accounting Practice ({galleryVideoStories.filter((v) => v.category === "accounting").length})
            </button>
          </div>
        </div>

        {/* Classroom Videos Grid (3 by default) */}
        <div className="mt-12 grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-6">
          {displayedVideos.map((story) => (
            <div
              key={story.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#cddce5] bg-white shadow-[0_6px_25px_-6px_rgba(16,44,69,0.06)] transition-all duration-300 hover:border-[#007fb8] hover:shadow-[0_20px_40px_-10px_rgba(0,127,184,0.18)] hover:-translate-y-1.5"
            >
              <div>
                {/* Video Thumbnail with Play Button */}
                <div
                  onClick={() => openVideo(story)}
                  className="relative h-[230px] w-full overflow-hidden bg-[#102c45] cursor-pointer"
                >
                  <Image
                    src={story.thumbnail}
                    alt={story.videoTitle}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 transition-opacity group-hover:opacity-90" />

                  {/* Play Button Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-[#007fb8] text-white shadow-xl shadow-[#007fb8]/50 transition-all duration-300 group-hover:scale-115 group-hover:bg-[#0ac9e8]">
                      <Play size={22} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badge: Achievement */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/25 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider border border-white/30">
                      <Award size={11} className="text-[#38d995]" /> {story.achievement}
                    </span>
                  </div>

                  {/* Bottom Duration Badge */}
                  <div className="absolute bottom-3 right-3.5 z-10 flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10.5px] font-bold text-white">
                    <Clock size={11} /> {story.duration}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 max-sm:p-5">
                  {/* Rating Stars & Verification */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1 text-[#f59e0b]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                      <span className="ml-1 text-[11px] font-extrabold text-[#102c45]">
                        5.0
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[#007fb8] uppercase tracking-wider">
                      <CheckCircle2 size={12} className="text-[#10b981]" /> Verified Session
                    </span>
                  </div>

                  <h3 className="text-[16px] font-black leading-snug text-[#102c45] line-clamp-2">
                    &ldquo;{story.videoTitle}&rdquo;
                  </h3>

                  <p className="mt-2.5 text-[13px] leading-relaxed italic text-[#475569] line-clamp-3">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Student Footer Meta */}
              <div className="border-t border-[#f1f5f9] bg-[#f8fafc] px-6 py-4 max-sm:px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="flex items-center gap-1 text-[13px] font-black text-[#102c45]">
                      {story.name}
                    </h4>
                    <p className="flex items-center gap-1 text-[11px] font-semibold text-[#60768a]">
                      <MapPin size={10} className="text-[#0ac9e8]" /> {story.school}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openVideo(story)}
                    className="inline-flex items-center gap-1 text-[12px] font-extrabold text-[#007fb8] hover:text-[#0ac9e8] transition-colors cursor-pointer"
                  >
                    Watch Video <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More / Show Less Toggle Button */}
        {filteredVideos.length > 3 && (
          <div className="mt-10 flex flex-col items-center justify-center">
            <button
              type="button"
              id="show-more-videos-btn"
              onClick={() => setShowAll(!showAll)}
              className="group inline-flex items-center gap-2.5 rounded-full border-2 border-[#007fb8] bg-white px-8 py-3 text-[13.5px] font-extrabold text-[#007fb8] shadow-md shadow-[#007fb8]/10 transition-all hover:bg-[#007fb8] hover:text-white hover:scale-102 hover:shadow-xl cursor-pointer"
            >
              {showAll ? (
                <>
                  <span>Show Less Videos</span>
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  <span>Show More Videos ({filteredVideos.length - 3} More)</span>
                  <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
            <p className="mt-2.5 text-[12px] font-medium text-[#64748b]">
              {showAll
                ? `Showing all ${filteredVideos.length} classroom session videos`
                : `Showing 3 of ${filteredVideos.length} classroom session videos`}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Video Playback Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex flex-col max-h-[94vh] max-w-[760px] w-full overflow-hidden rounded-3xl border border-white/20 bg-[#ffffff] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4 max-sm:px-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e0f2fe] px-3 py-0.5 text-[11px] font-extrabold text-[#0284c7] uppercase">
                  <Award size={12} /> {activeStory.achievement}
                </span>
                <span className="text-[12px] font-bold text-[#64748b]">
                  {activeStory.batch}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-bold text-[#64748b] mr-2 hidden sm:inline">
                  Video {(activeStoryIndex ?? 0) + 1} of {galleryVideoStories.length}
                </span>
                <button
                  type="button"
                  onClick={closeVideo}
                  className="flex size-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Video Player Display */}
            <div className="p-6 max-sm:p-4 max-h-[calc(94vh-80px)] overflow-y-auto">
              <div className="relative h-[420px] max-sm:h-[300px] w-full overflow-hidden rounded-2xl bg-black shadow-inner flex items-center justify-center">
                <video
                  key={activeStory.id}
                  src={activeStory.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="h-full w-full object-contain bg-black"
                />

                {/* Prev / Next Video buttons overlay */}
                <button
                  type="button"
                  onClick={showPrevVideo}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black cursor-pointer shadow-lg"
                  aria-label="Previous video"
                  title="Previous video"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={showNextVideo}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black cursor-pointer shadow-lg"
                  aria-label="Next video"
                  title="Next video"
                >
                  <ChevronRight size={22} />
                </button>
              </div>

              {/* Student Insights & Full Quote */}
              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-[20px] font-black text-[#102c45] leading-snug">
                    {activeStory.videoTitle}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#007fb8]">
                    <span>{activeStory.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {activeStory.school}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-[#10b981]">{activeStory.scoreHighlight}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-[13.5px] leading-relaxed text-[#334155] italic">
                  &ldquo;{activeStory.fullTestimonial}&rdquo;
                </div>

                {/* Key Discussion Highlights */}
                <div>
                  <h4 className="text-[12px] font-black tracking-wider text-[#102c45] uppercase mb-2">
                    Key Highlights in This Video:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {activeStory.keyTopics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-[12.5px] font-medium text-[#475569]"
                      >
                        <CheckCircle2 size={14} className="text-[#10b981] shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeVideo();
                      onOpenJoin("2026/2027 O/L Commerce Batch");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#007fb8_0%,#005d8f_100%)] py-3.5 text-[14px] font-extrabold text-white shadow-lg shadow-[#007fb8]/30 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    Join Evon Aravinda&apos;s Next Session <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

