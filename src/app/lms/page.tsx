"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Sparkles, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StudentLoginModal from "@/components/StudentLoginModal";
import JoinModal from "@/components/JoinModal";
import { getCurrentLmsUser } from "@/lib/lmsStore";

export default function LmsIndexPage() {
  const router = useRouter();
  const [currentUser] = useState(() => getCurrentLmsUser());
  const [isLoginOpen, setIsLoginOpen] = useState(() => !getCurrentLmsUser());
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        router.push("/lms/admin");
      } else {
        router.push("/lms/student");
      }
    }
  }, [currentUser, router]);

  if (currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07192a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-3 border-[#0ac9e8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-white/70">Connecting to LMS Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf2f3] text-[#102c45]">
      <Header onOpenJoin={() => setIsJoinOpen(true)} onOpenLogin={() => setIsLoginOpen(true)} />

      <main className="py-16 px-4">
        <div className="mx-auto max-w-lg text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e0f2fe] px-4 py-1.5 text-xs font-black uppercase text-[#007fb8] border border-[#007fb8]/20 mb-4">
            <ShieldCheck size={14} className="text-[#38d995]" /> Evon Aravinda Learning Management System
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#102c45]">
            Access to Success LMS Portal
          </h1>
          <p className="mt-3 text-sm text-[#475569] leading-relaxed">
            Welcome to the centralized student &amp; admin portal. Log in to review paper class marks, take online quizzes, and check detailed progress evaluations.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl hover:scale-102 active:scale-95 transition-all cursor-pointer"
            >
              <span>Sign In with Phone or Index Number</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => setIsJoinOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full border border-[#cbd5e1] bg-white py-3.5 text-xs font-bold text-[#102c45] shadow-xs hover:border-[#007fb8] hover:text-[#007fb8] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles size={14} className="text-[#38d995]" />
              <span>Not Registered? Enroll in Next Batch</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#64748b] hover:text-[#102c45] mt-2"
            >
              <Home size={13} /> Back to Website Homepage
            </Link>
          </div>
        </div>
      </main>

      <Footer onOpenJoin={() => setIsJoinOpen(true)} onOpenLogin={() => setIsLoginOpen(true)} />

      <StudentLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenJoin={() => {
          setIsLoginOpen(false);
          setIsJoinOpen(true);
        }}
      />
      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onOpenLogin={() => {
          setIsJoinOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
}

