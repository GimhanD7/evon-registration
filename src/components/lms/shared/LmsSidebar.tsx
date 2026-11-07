import React from "react";
import Link from "next/link";
import Image from "next/image";
import { User as UserIcon, ArrowLeft, LogOut, X, LucideIcon } from "lucide-react";
import { LMSUser } from "@/data/lmsData";

export interface LmsMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface LmsSidebarProps {
  items: LmsMenuItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  user: LMSUser;
  role: "admin" | "student";
  onLogout: () => void;
}

export default function LmsSidebar({
  items,
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  user,
  role,
  onLogout,
}: LmsSidebarProps) {
  const isAdmin = role === "admin";

  const profileCard = (
    <div className="relative overflow-hidden rounded-2xl border border-[#cddce5] bg-white p-3.5 shadow-xs flex flex-col items-center text-center shrink-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-20 rounded-full bg-[#0ac9e8]/15 blur-lg"
      />

      <div className="relative flex size-12 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white shadow-md shadow-[#007fb8]/30 overflow-hidden">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.fullName}
            width={48}
            height={48}
            className="size-full object-cover"
          />
        ) : (
          <UserIcon size={24} className="text-[#0ac9e8]" strokeWidth={2.2} />
        )}
      </div>

      <h2 className="mt-2 text-sm font-black text-[#102c45] leading-tight truncate max-w-full">
        {user.fullName}
      </h2>
      <p className="mt-0.5 text-[11px] font-bold text-[#60768a] truncate max-w-full">
        {isAdmin ? "System Administrator" : user.batch || "Commerce Student"}
      </p>

      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#38d995]/50 bg-[#e8f7f2] px-2.5 py-0.5 text-[9.5px] font-black text-[#159366]">
        <span className="size-1.5 rounded-full bg-[#159366] animate-pulse" />
        {isAdmin ? "Verified Master Access" : "Enrolled • Active"}
      </div>
    </div>
  );

  const navigationList = (
    <nav className="rounded-2xl border border-[#cddce5] bg-white p-2 shadow-xs space-y-1 shrink-0">
      {items.map((item) => {
        const ItemIcon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelectTab(item.id);
              onCloseMobile();
            }}
            className={`relative flex w-full items-center justify-between px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isActive
                ? "bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white shadow-md shadow-[#007fb8]/20"
                : "text-[#60768a] hover:text-[#102c45] hover:bg-[#edf2f3]/70"
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#0ac9e8]" />
            )}

            <div className="flex items-center gap-2.5">
              <ItemIcon
                size={16}
                className={isActive ? "text-[#0ac9e8]" : "text-[#94a3b8]"}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-black ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#edf2f3] text-[#60768a]"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}

      <div className="pt-1.5 border-t border-[#cddce5]/60 mt-1.5 space-y-1">
        <Link
          href="/"
          className="flex w-full items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] hover:text-[#102c45] transition-colors"
        >
          <ArrowLeft size={15} className="text-[#94a3b8]" />
          <span>Website Home</span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer (Only on screens < lg) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#edf2f3] p-4 shadow-2xl overflow-y-auto space-y-4 lg:hidden transition-transform duration-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-black text-[#102c45] uppercase tracking-wider">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl border border-[#cddce5] bg-white p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {profileCard}
        {navigationList}
      </aside>

      {/* Desktop Fixed Sidebar (Non-scrolling, fits entirely within screen height) */}
      <aside className="hidden lg:flex w-[260px] xl:w-[270px] shrink-0 h-full flex-col justify-between overflow-hidden bg-[#edf2f3]/70 backdrop-blur-md p-4 border-r border-[#cddce5]/70 gap-3 select-none">
        <div className="space-y-3">
          {profileCard}
          {navigationList}
        </div>
      </aside>
    </>
  );
}
