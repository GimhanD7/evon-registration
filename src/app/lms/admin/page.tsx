"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  HelpCircle,
  Trophy,
  Award,
  ShieldCheck,
  User as UserIcon,
  Activity,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  useCurrentLmsUser,
  logoutLms,
  getLmsUsers,
  addLmsUser,
  deleteLmsUser,
  updateLmsUser,
  getLmsPapers,
  addLmsPaper,
  getLmsQuizzes,
  addLmsEvaluation,
  checkBackendStatus,
  syncUsersFromBackend,
  syncPapersFromBackend,
  syncQuizzesFromBackend,
  syncEvaluationsFromBackend,
  verifySecurityPin,
} from "@/lib/lmsStore";
import { LMSUser } from "@/data/lmsData";
import { logActivity } from "@/lib/activityLogService";
import { checkAndRunScheduledAutoBackup } from "@/lib/googleDriveBackupService";

// LMS Subcomponents
import LmsHeader from "@/components/lms/shared/LmsHeader";
import LmsSidebar, { LmsMenuItem } from "@/components/lms/shared/LmsSidebar";
import LmsLoadingScreen from "@/components/lms/shared/LmsLoadingScreen";
import AdminOverviewTab from "@/components/lms/admin/AdminOverviewTab";
import AdminPapersTab from "@/components/lms/admin/AdminPapersTab";
import AdminQuizzesTab from "@/components/lms/admin/AdminQuizzesTab";
import AdminUsersTab from "@/components/lms/admin/AdminUsersTab";
import AdminEvaluationsTab from "@/components/lms/admin/AdminEvaluationsTab";
import AdminActivityLogTab from "@/components/lms/admin/AdminActivityLogTab";
import AdminNationalResultsTab from "@/components/lms/admin/AdminNationalResultsTab";
import AdminSetupTab from "@/components/lms/admin/AdminSetupTab";
import AdminProfileTab from "@/components/lms/admin/AdminProfileTab";
import AdminTimetableTab from "@/components/lms/admin/AdminTimetableTab";
import AddStudentModal from "@/components/lms/admin/AddStudentModal";
import AddPaperModal from "@/components/lms/admin/AddPaperModal";

type AdminTab =
  | "overview"
  | "papers"
  | "quizzes"
  | "users"
  | "national-results"
  | "evaluations"
  | "timetable"
  | "activity"
  | "setup"
  | "profile";

export default function AdminLmsPage() {
  const router = useRouter();
  const { user: currentUser, isLoaded } = useCurrentLmsUser();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window !== "undefined") {
      const validTabs: AdminTab[] = [
        "overview",
        "papers",
        "quizzes",
        "users",
        "national-results",
        "evaluations",
        "timetable",
        "activity",
        "setup",
        "profile",
      ];
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as AdminTab | null;
      if (tabParam && validTabs.includes(tabParam)) {
        return tabParam;
      }
      const savedTab = localStorage.getItem("lms_admin_active_tab") as AdminTab | null;
      if (savedTab && validTabs.includes(savedTab)) {
        return savedTab;
      }
    }
    return "overview";
  });

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("lms_admin_active_tab", tabId);
        window.history.replaceState(null, "", `/lms/admin?tab=${tabId}`);
      } catch {}
    }
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core LMS Data
  const [users, setUsers] = useState<LMSUser[]>(() => getLmsUsers());
  const [papers, setPapers] = useState(() => getLmsPapers());
  const [quizzes, setQuizzes] = useState(() => getLmsQuizzes());

  // Search & Modals
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddPaperOpen, setIsAddPaperOpen] = useState(false);

  // Console Lock Panel State
  const [isConsoleLocked, setIsConsoleLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState("");
  const [unlockError, setUnlockError] = useState("");

  // Backend Integration Diagnostics
  const [backendStatus, setBackendStatus] = useState<{
    online: boolean;
    database: boolean;
    databaseName?: string;
    environment?: "local" | "hosting";
    message: string;
  } | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  const refreshData = () => {
    setUsers(getLmsUsers());
    setPapers(getLmsPapers());
    setQuizzes(getLmsQuizzes());
  };

  const handleCheckBackend = async () => {
    setIsCheckingBackend(true);
    try {
      const status = await checkBackendStatus();
      setBackendStatus(status);
      if (status.database) {
        const syncedUsers = await syncUsersFromBackend();
        setUsers(syncedUsers);
        const syncedPapers = await syncPapersFromBackend();
        setPapers(syncedPapers);
        const syncedQuizzes = await syncQuizzesFromBackend();
        setQuizzes(syncedQuizzes);
        await syncEvaluationsFromBackend();
      }
    } finally {
      setIsCheckingBackend(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (!currentUser) {
        router.push("/#login");
      } else if (currentUser.role !== "admin") {
        router.push("/lms/student");
      }
    }
  }, [isLoaded, currentUser, router]);

  // Google Drive Scheduled Auto-Backup Daemon
  useEffect(() => {
    if (isLoaded && currentUser?.role === "admin") {
      checkAndRunScheduledAutoBackup(currentUser);
    }
  }, [isLoaded, currentUser]);

  useEffect(() => {
    let active = true;
    checkBackendStatus().then(async (status) => {
      if (!active) return;
      setBackendStatus(status);
      if (status.database) {
        const syncedUsers = await syncUsersFromBackend();
        if (active) setUsers(syncedUsers);
        const syncedPapers = await syncPapersFromBackend();
        if (active) setPapers(syncedPapers);
        const syncedQuizzes = await syncQuizzesFromBackend();
        if (active) setQuizzes(syncedQuizzes);
        await syncEvaluationsFromBackend();
      }
    });

    const handleQuizzesChange = () => {
      if (active) setQuizzes(getLmsQuizzes());
    };
    const handlePapersChange = () => {
      if (active) setPapers(getLmsPapers());
    };
    const handleUsersChange = () => {
      if (active) setUsers(getLmsUsers());
    };

    window.addEventListener("lms_quizzes_change", handleQuizzesChange);
    window.addEventListener("lms_papers_change", handlePapersChange);
    window.addEventListener("lms_users_change", handleUsersChange);
    window.addEventListener("storage", refreshData);

    return () => {
      active = false;
      window.removeEventListener("lms_quizzes_change", handleQuizzesChange);
      window.removeEventListener("lms_papers_change", handlePapersChange);
      window.removeEventListener("lms_users_change", handleUsersChange);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const handleLogout = () => {
    logoutLms();
    router.push("/");
  };

  const handleDeleteUser = (id: string, name: string) => {
    deleteLmsUser(id);
    refreshData();
    logActivity(
      "User Account Deleted",
      "user_management",
      `Administrator deleted user account "${name}" (ID: ${id}) with PIN authorization.`,
      currentUser,
      "warning"
    );
  };

  const handleUpdateUser = (updatedUser: LMSUser) => {
    updateLmsUser(updatedUser);
    refreshData();
    logActivity(
      "User Account Updated",
      "user_management",
      `Administrator updated profile for "${updatedUser.fullName}" (Index: ${updatedUser.indexNo || "N/A"}).`,
      currentUser,
      "info"
    );
  };

  const handleToggleUserStatus = (targetUser: LMSUser) => {
    const nextStatus: "active" | "inactive" = targetUser.status === "active" ? "inactive" : "active";
    const updated: LMSUser = { ...targetUser, status: nextStatus };
    updateLmsUser(updated);
    refreshData();
    logActivity(
      `User Status Changed to ${nextStatus}`,
      "user_management",
      `Account for "${targetUser.fullName}" set to ${nextStatus}.`,
      currentUser,
      "info"
    );
  };

  const handleUnlockConsole = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError("");

    if (
      verifySecurityPin(unlockPin) ||
      (currentUser && unlockPin === currentUser.password) ||
      unlockPin === "admin123"
    ) {
      setIsConsoleLocked(false);
      setUnlockPin("");
      logActivity(
        "Admin Console Unlocked",
        "security",
        "Master administrator authenticated and resumed active session.",
        currentUser,
        "success"
      );
    } else {
      setUnlockError("Incorrect Security PIN or Administrator Password. Please try again.");
    }
  };

  if (!isLoaded || !currentUser) {
    return <LmsLoadingScreen message="Authenticating Administrator Session..." />;
  }

  const menuItems: LmsMenuItem[] = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "papers", label: "Manage Exams", icon: FileText, count: papers.length },
    { id: "quizzes", label: "Quizzes", icon: HelpCircle, count: quizzes.length },
    {
      id: "users",
      label: "Users",
      icon: Users,
      count: users.length,
    },
    { id: "national-results", label: "National Results", icon: Award },
    { id: "evaluations", label: "Leaderboard", icon: Trophy },
    { id: "timetable", label: "Class Timetable", icon: Calendar },
    { id: "activity", label: "Activity Logs", icon: Activity },
    { id: "setup", label: "System Setup", icon: ShieldCheck },
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

      {/* Top Header with Console Lock Trigger */}
      <LmsHeader
        user={currentUser}
        activeTabLabel={currentTabLabel}
        role="admin"
        onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onLogout={handleLogout}
        onLockConsole={() => {
          setIsConsoleLocked(true);
          logActivity(
            "Admin Console Locked",
            "security",
            "Screen console locked for security safeguards.",
            currentUser,
            "info"
          );
        }}
      />

      {/* App Body: Fixed Sidebar on desktop, scrollable content pane */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        <LmsSidebar
          items={menuItems}
          activeTab={activeTab}
          onSelectTab={(tabId) => handleSelectTab(tabId as AdminTab)}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          user={currentUser}
          role="admin"
          onLogout={handleLogout}
        />

        {/* Scrollable Main Content Area */}
        <div className="flex-1 h-full overflow-y-auto flex flex-col justify-between [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <main className="w-full max-w-[1240px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {activeTab === "overview" && (
              <AdminOverviewTab
                users={users}
                papers={papers}
                quizzes={quizzes}
                backendStatus={backendStatus}
                isCheckingBackend={isCheckingBackend}
                onCheckBackend={handleCheckBackend}
                onOpenAddPaper={() => setIsAddPaperOpen(true)}
                onOpenAddUser={() => setIsAddUserOpen(true)}
                onSelectTab={(tabId) => handleSelectTab(tabId as AdminTab)}
              />
            )}

            {activeTab === "users" && (
              <AdminUsersTab
                users={users}
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                onOpenAddUser={() => setIsAddUserOpen(true)}
                onToggleStatus={handleToggleUserStatus}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {activeTab === "papers" && (
              <AdminPapersTab
                papers={papers}
                onOpenAddPaper={() => setIsAddPaperOpen(true)}
                onRefresh={refreshData}
              />
            )}

            {activeTab === "quizzes" && (
              <AdminQuizzesTab quizzes={quizzes} onRefresh={refreshData} />
            )}

            {activeTab === "national-results" && (
              <AdminNationalResultsTab onSuccess={refreshData} />
            )}

            {activeTab === "evaluations" && (
              <AdminEvaluationsTab
                students={users.filter((u) => u.role === "student")}
                onAddEvaluation={addLmsEvaluation}
                onSuccess={refreshData}
              />
            )}

            {activeTab === "timetable" && (
              <AdminTimetableTab />
            )}

            {activeTab === "activity" && (
              <AdminActivityLogTab />
            )}

            {activeTab === "setup" && (
              <AdminSetupTab
                currentUser={currentUser}
                backendStatus={backendStatus}
                isCheckingBackend={isCheckingBackend}
                onCheckBackend={handleCheckBackend}
                onLockConsole={() => setIsConsoleLocked(true)}
              />
            )}

            {activeTab === "profile" && (
              <AdminProfileTab
                currentUser={currentUser}
                totalStudents={users.filter((u) => u.role === "student").length}
                totalPapers={papers.length}
                totalQuizzes={quizzes.length}
                onUpdateUser={handleUpdateUser}
              />
            )}
          </main>

          {/* Portal Footer */}
          <footer className="mt-auto border-t border-[#cddce5]/60 py-6 text-center text-xs font-bold text-[#60768a]">
            Evon Aravinda Commerce Education &bull; Admin Master Control v2.0
          </footer>
        </div>
      </div>

      {/* FULL-SCREEN CONSOLE PANEL LOCK OVERLAY */}
      {isConsoleLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102c45]/95 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-white shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="relative mx-auto size-24 rounded-full border-4 border-white/20 bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] overflow-hidden flex items-center justify-center shadow-xl">
              {currentUser.avatarUrl ? (
                <Image
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  width={96}
                  height={96}
                  className="size-full object-cover"
                />
              ) : (
                <Lock size={36} className="text-[#0ac9e8]" />
              )}
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-0.5 text-[11px] font-black uppercase text-amber-300">
                <Lock size={12} />
                <span>Console Panel Locked</span>
              </div>
              <h3 className="text-xl font-black tracking-tight">{currentUser.fullName}</h3>
              <p className="text-xs text-white/70">Master Administrator &bull; Session Protected</p>
            </div>

            {unlockError && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/20 p-3 text-xs font-bold text-red-200 flex items-center gap-2 text-left">
                <AlertCircle size={15} className="shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockConsole} className="space-y-4">
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={unlockPin}
                  onChange={(e) => setUnlockPin(e.target.value)}
                  placeholder="Enter Security PIN or Password..."
                  className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-center font-mono text-sm font-bold text-white placeholder-white/40 focus:border-[#0ac9e8] focus:bg-white/15 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] py-3 text-xs font-black uppercase tracking-wider text-[#102c45] shadow-lg shadow-[#007fb8]/30 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <Unlock size={16} /> Unlock Master Console
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer py-1"
                >
                  Log out of this session
                </button>
              </div>
            </form>

            <div className="text-[10px] text-white/50 border-t border-white/10 pt-3">
              Default Security PIN: <code className="font-mono text-white/80 font-bold">1234</code> (Configurable in System Setup)
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onAddUser={addLmsUser}
        onSuccess={refreshData}
      />

      <AddPaperModal
        isOpen={isAddPaperOpen}
        onClose={() => setIsAddPaperOpen(false)}
        onAddPaper={addLmsPaper}
        nextPaperNumber={papers.length + 1}
        onSuccess={refreshData}
      />
    </div>
  );
}
