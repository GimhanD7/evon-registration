"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import FeaturePillars from "@/components/FeaturePillars";
import TimetableSection from "@/components/TimetableSection";
import TopRanksShowcase from "@/components/TopRanksShowcase";
import LearningPlatformPreview from "@/components/LearningPlatformPreview";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import StudentLoginModal from "@/components/StudentLoginModal";
import JoinModal from "@/components/JoinModal";
import VideoModal from "@/components/VideoModal";
import SearchModal from "@/components/SearchModal";

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(
    undefined
  );

  const handleOpenJoin = (courseName?: string) => {
    setSelectedCourse(courseName);
    setIsJoinOpen(true);
  };

  const handleSelectCourseFromSearch = (courseName: string) => {
    setSelectedCourse(courseName);
    setIsJoinOpen(true);
  };

  return (
    <main className="min-h-screen">
      {/* Navigation Header */}
      <Header
        onOpenJoin={() => handleOpenJoin("2027 O/L Commerce Foundation Batch")}
      />

      {/* Hero Section matching design image */}
      <Hero
        onOpenJoin={() => handleOpenJoin()}
        onOpenVideo={() => setIsVideoOpen(true)}
        onOpenCourses={() => {
          const timetableEl = document.getElementById("timetable");
          timetableEl?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Stats Counter Section */}
      <StatsCounter onOpenJoin={() => handleOpenJoin()} />

      {/* 4 Pillars of Success Section */}
      <FeaturePillars onOpenJoin={() => handleOpenJoin()} />

      {/* Class Timetable Section */}
      <TimetableSection onOpenJoin={handleOpenJoin} />

      {/* Top Ranks Islandwide Hall of Fame */}
      <TopRanksShowcase />

      {/* Complete Digital Learning Platform Showcase */}
      {/* <LearningPlatformPreview onOpenJoin={() => handleOpenJoin()} /> */}

      {/* Student & Parent Reviews */}
      {/* <Testimonials /> */}

      {/* Footer */}
      <Footer
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenJoin={() => handleOpenJoin()}
      />

      {/* Interactive Modals */}
      <StudentLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <JoinModal
        key={selectedCourse ?? "general"}
        isOpen={isJoinOpen}
        initialCourse={selectedCourse}
        onClose={() => {
          setIsJoinOpen(false);
          setSelectedCourse(undefined);
        }}
      />

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        onOpenJoin={() => handleOpenJoin()}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCourse={handleSelectCourseFromSearch}
      />
    </main>
  );
}
