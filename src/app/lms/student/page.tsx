"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Trophy,
  Award,
  User as UserIcon,
} from "lucide-react";
import {
  useCurrentLmsUser,
  logoutLms,
  getLmsPapers,
  syncPapersFromBackend,
  getLmsQuizzes,
  syncQuizzesFromBackend,
  saveQuizScore,
  getLmsEvaluations,
  syncEvaluationsFromBackend,
  updateLmsUser,
} from "@/lib/lmsStore";

// LMS Subcomponents
import LmsHeader from "@/components/lms/shared/LmsHeader";
import LmsSidebar, { LmsMenuItem } from "@/components/lms/shared/LmsSidebar";
import LmsLoadingScreen from "@/components/lms/shared/LmsLoadingScreen";
import StudentOverviewTab from "@/components/lms/student/StudentOverviewTab";
import StudentPapersTab from "@/components/lms/student/StudentPapersTab";
import StudentQuizzesTab from "@/components/lms/student/StudentQuizzesTab";
import StudentResultsTab from "@/components/lms/student/StudentResultsTab";
import StudentEvaluationTab from "@/components/lms/student/StudentEvaluationTab";
import StudentProfileTab from "@/components/lms/student/StudentProfileTab";
import StudentMobileBottomNav from "@/components/lms/student/StudentMobileBottomNav";

type StudentTab = "overview" | "papers" | "quizzes" | "results" | "evaluation" | "profile";

export default function StudentLmsPage() {
  const router = useRouter();
  const { user: currentUser, isLoaded } = useCurrentLmsUser();
  const [activeTab, setActiveTab] = useState<StudentTab>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as StudentTab | null;
      if (
        tabParam &&
        ["overview", "papers", "quizzes", "results", "evaluation", "profile"].includes(
          tabParam
        )
      ) {
        return tabParam;
      }
    }
    return "overview";
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core Data
  const currentUserId = currentUser?.id;
  const [papers, setPapers] = useState(() => getLmsPapers());
  const [quizzes, setQuizzes] = useState(() => getLmsQuizzes());
  const [evaluations, setEvaluations] = useState(() => {
    return currentUserId ? getLmsEvaluations(currentUserId) : getLmsEvaluations();
  });

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (!active) return;
      setPapers(getLmsPapers());
      setQuizzes(getLmsQuizzes());
      setEvaluations(currentUserId ? getLmsEvaluations(currentUserId) : getLmsEvaluations());
    };
    refresh();

    Promise.all([
      syncPapersFromBackend(),
      syncQuizzesFromBackend(),
      syncEvaluationsFromBackend(),
    ]).then(() => {
      if (active) refresh();
    });

    window.addEventListener("lms_papers_change", refresh);
    window.addEventListener("lms_quizzes_change", refresh);
    window.addEventListener("lms_evaluations_change", refresh);
    return () => {
      active = false;
      window.removeEventListener("lms_papers_change", refresh);
      window.removeEventListener("lms_quizzes_change", refresh);
      window.removeEventListener("lms_evaluations_change", refresh);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (isLoaded && !currentUser) {
      router.push("/#login");
    }
  }, [isLoaded, currentUser, router]);

  const handleSelectTab = (tabId: StudentTab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/lms/student?tab=${tabId}`);
    }
  };

  const handleLogout = () => {
    logoutLms();
    router.push("/");
  };

  const handleSaveQuizScore = (quizId: string, score: number, total: number) => {
    saveQuizScore(quizId, score, total);
    setQuizzes(getLmsQuizzes());
  };

  const handleUpdatePassword = (newPassword: string) => {
    if (!currentUser) return;
    updateLmsUser({ ...currentUser, password: newPassword });
  };

  if (!isLoaded || !currentUser) {
    return <LmsLoadingScreen message="Loading Student LMS Portal..." />;
  }

  const menuItems: LmsMenuItem[] = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "papers", label: "Model Papers", icon: FileText, count: papers.length },
    { id: "quizzes", label: "Interactive Quizzes", icon: HelpCircle, count: quizzes.length },
    { id: "results", label: "Exam Results", icon: Award },
    { id: "evaluation", label: "Leaderboard", icon: Trophy },
    { id: "profile", label: "My Profile", icon: UserIcon },
  ];

  const currentTabLabel = menuItems.find((m) => m.id === activeTab)?.label || "Overview";

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#edf2f3] text-[#102c45] antialiased selection:bg-[#007fb8]/20 selection:text-[#007fb8] flex flex-col relative">
      {/* Ambient background glows matching Home Page Hero */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-40 size-[600px] rounded-full bg-[#7daac6]/20 blur-[130px]"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/3 -right-40 size-[500px] rounded-full bg-[#007fb8]/15 blur-[130px]"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/4 size-[450px] rounded-full bg-[#38d995]/15 blur-[120px]"
        />
      </div>

      {/* Top Header */}
      <LmsHeader
        user={currentUser}
        activeTabLabel={currentTabLabel}
        role="student"
        onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onLogout={handleLogout}
      />

      {/* App Body: Fixed Sidebar on desktop, scrollable content pane */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        <LmsSidebar
          items={menuItems}
          activeTab={activeTab}
          onSelectTab={(tabId) => handleSelectTab(tabId as StudentTab)}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          user={currentUser}
          role="student"
          onLogout={handleLogout}
        />

        {/* Scrollable Main Content Area */}
        <div className="flex-1 h-full overflow-y-auto flex flex-col justify-between [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <main className="w-full max-w-[1240px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-28 md:pb-6">
            {activeTab === "overview" && (
              <StudentOverviewTab
                papers={papers}
                evaluations={evaluations}
                onSelectTab={(tabId) => handleSelectTab(tabId as StudentTab)}
              />
            )}

            {activeTab === "papers" && <StudentPapersTab papers={papers} />}

            {activeTab === "quizzes" && (
              <StudentQuizzesTab
                quizzes={quizzes}
                onSaveQuizScore={handleSaveQuizScore}
              />
            )}

            {activeTab === "results" && (
              <StudentResultsTab
                currentUser={currentUser}
                papers={papers}
              />
            )}

            {activeTab === "evaluation" && (
              <StudentEvaluationTab
                evaluations={evaluations}
                currentUser={currentUser}
                papers={papers}
                quizzes={quizzes}
              />
            )}

            {activeTab === "profile" && (
              <StudentProfileTab
                currentUser={currentUser}
                onUpdatePassword={handleUpdatePassword}
              />
            )}
          </main>

          {/* Portal Footer */}
          <footer className="mt-auto border-t border-[#cddce5]/60 py-6 text-center text-xs font-bold text-[#60768a] pb-24 md:pb-6">
            Evon Aravinda Commerce Education &bull; Student LMS Portal v2.0
          </footer>
        </div>
      </div>

      {/* Modern Student Mobile Bottom Navigation Bar with LMS Icons & Functions */}
      <StudentMobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tabId) => handleSelectTab(tabId as StudentTab)}
        counts={{
          papers: papers.length,
          quizzes: quizzes.length,
          evaluations: evaluations.length,
        }}
      />
    </div>
  );
}
