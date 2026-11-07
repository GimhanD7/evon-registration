"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  HelpCircle,
  Award,
  ShieldCheck,
  User as UserIcon,
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
} from "@/lib/lmsStore";
import { LMSUser } from "@/data/lmsData";

// LMS Subcomponents
import LmsHeader from "@/components/lms/shared/LmsHeader";
import LmsSidebar, { LmsMenuItem } from "@/components/lms/shared/LmsSidebar";
import LmsLoadingScreen from "@/components/lms/shared/LmsLoadingScreen";
import AdminOverviewTab from "@/components/lms/admin/AdminOverviewTab";
import AdminPapersTab from "@/components/lms/admin/AdminPapersTab";
import AdminQuizzesTab from "@/components/lms/admin/AdminQuizzesTab";
import AdminStudentsTab from "@/components/lms/admin/AdminStudentsTab";
import AdminEvaluationsTab from "@/components/lms/admin/AdminEvaluationsTab";
import AdminSettingsTab from "@/components/lms/admin/AdminSettingsTab";
import AdminProfileTab from "@/components/lms/admin/AdminProfileTab";
import AddStudentModal from "@/components/lms/admin/AddStudentModal";
import AddPaperModal from "@/components/lms/admin/AddPaperModal";

type AdminTab = "overview" | "papers" | "quizzes" | "users" | "evaluations" | "settings" | "profile";

export default function AdminLmsPage() {
  const router = useRouter();
  const { user: currentUser, isLoaded } = useCurrentLmsUser();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core LMS Data
  const [users, setUsers] = useState<LMSUser[]>(() => getLmsUsers());
  const [papers, setPapers] = useState(() => getLmsPapers());
  const [quizzes] = useState(() => getLmsQuizzes());

  // Search & Modals
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddPaperOpen, setIsAddPaperOpen] = useState(false);

  // Backend Integration Diagnostics
  const [backendStatus, setBackendStatus] = useState<{
    online: boolean;
    database: boolean;
    message: string;
  } | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

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
      }
    } finally {
      setIsCheckingBackend(false);
    }
  };

  useEffect(() => {
    if (isLoaded && (!currentUser || currentUser.role !== "admin")) {
      router.push("/#login");
    }
  }, [isLoaded, currentUser, router]);

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
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const refreshData = () => {
    setUsers(getLmsUsers());
    setPapers(getLmsPapers());
  };

  const handleLogout = () => {
    logoutLms();
    router.push("/");
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove student "${name}"?`)) {
      deleteLmsUser(id);
      refreshData();
    }
  };

  const handleToggleUserStatus = (targetUser: LMSUser) => {
    const nextStatus = targetUser.status === "active" ? "inactive" : "active";
    updateLmsUser({ ...targetUser, status: nextStatus });
    refreshData();
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
      label: "Students",
      icon: Users,
      count: users.filter((u) => u.role === "student").length,
    },
    { id: "evaluations", label: "Record Evaluations", icon: Award },
    { id: "settings", label: "Security & System", icon: ShieldCheck },
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
        role="admin"
        onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onLogout={handleLogout}
      />

      {/* App Body: Fixed Sidebar on desktop, scrollable content pane */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        <LmsSidebar
          items={menuItems}
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId as AdminTab)}
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
                onSelectTab={(tabId) => setActiveTab(tabId as AdminTab)}
              />
            )}

            {activeTab === "users" && (
              <AdminStudentsTab
                users={users}
                searchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                onOpenAddUser={() => setIsAddUserOpen(true)}
                onToggleStatus={handleToggleUserStatus}
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

            {activeTab === "quizzes" && <AdminQuizzesTab quizzes={quizzes} />}

            {activeTab === "evaluations" && (
              <AdminEvaluationsTab
                students={users.filter((u) => u.role === "student")}
                onAddEvaluation={addLmsEvaluation}
                onSuccess={refreshData}
              />
            )}

            {activeTab === "settings" && (
              <AdminSettingsTab
                currentUser={currentUser}
                backendStatus={backendStatus}
                isCheckingBackend={isCheckingBackend}
                onCheckBackend={handleCheckBackend}
              />
            )}

            {activeTab === "profile" && (
              <AdminProfileTab
                currentUser={currentUser}
                totalStudents={users.filter((u) => u.role === "student").length}
                totalPapers={papers.length}
                totalQuizzes={quizzes.length}
              />
            )}
          </main>

          {/* Portal Footer */}
          <footer className="mt-auto border-t border-[#cddce5]/60 py-6 text-center text-xs font-bold text-[#60768a]">
            Evon Aravinda Commerce Education &bull; Admin Master Control v2.0
          </footer>
        </div>
      </div>

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
