"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onOpenJoin: () => void;
}

const navItems = [
  { name: "Home", href: "/#hero" },
  { name: "Timetable", href: "/#timetable" },
  { name: "Institutes", href: "/timetable" },
  { name: "Results", href: "/results" },
  { name: "Contact", href: "/#contact" },
];

export default function Header({
  onOpenJoin,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <header className="sticky top-0 z-[100] bg-transparent px-6 py-2.5 max-[640px]:px-3">
      <div className="relative mx-auto max-w-[1152px]">
        <div className="flex min-h-[68px] items-center justify-between gap-6 rounded-full border border-white bg-white/95 py-2.5 pr-[18px] pl-[18px] shadow-[0_8px_32px_-16px_rgba(16,67,48,0.14)] backdrop-blur-xl max-[640px]:min-h-[64px] max-[640px]:gap-2 max-[640px]:px-3">
          <a
            href="#hero"
            id="logo-brand"
            aria-label="Access to Success home"
            className="flex shrink-0 items-center gap-3 max-[640px]:gap-2"
            onClick={() => {
              setActiveTab("Home");
              setMobileMenuOpen(false);
            }}
          >
            <span aria-hidden="true" className="flex size-11 shrink-0 flex-col items-center justify-center rounded-[13px] bg-[linear-gradient(145deg,#a6f4ce_0%,#38d995_55%,#19b978_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] max-[640px]:size-9">
              <span className="text-[20px] leading-none font-black tracking-[-1px]">EA</span>
              <span className="mt-0.5 text-[6px] leading-none font-extrabold tracking-[0.4px]">EDUCATION</span>
            </span>
            <span className="flex min-w-0 flex-col gap-0.5 max-[420px]:hidden">
              <span className="text-[17px] leading-tight font-bold tracking-[-0.4px] text-[#102c45] max-[640px]:text-[12px]">Access to Success</span>
              <span className="text-[12px] leading-tight font-medium text-[#72859c] max-[640px]:text-[9px]">with Evon Aravinda</span>
            </span>
          </a>

          <nav aria-label="Main navigation" className="flex items-center gap-6 max-[1100px]:hidden">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-current={activeTab === item.name ? "location" : undefined}
                className="whitespace-nowrap py-2 text-[12px] font-medium text-[#3d5069] transition-colors hover:text-[#159366] focus-visible:text-[#159366]"
                onClick={() => setActiveTab(item.name)}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5 max-[640px]:gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJoin();
              }}
              className="rounded-full bg-[#0c2944] px-[22px] py-3 text-[12px] leading-4 font-bold text-white shadow-[0_4px_9px_-4px_rgba(12,41,68,0.3)] transition-colors hover:bg-[#164466] min-h-11 max-[640px]:max-w-[135px] max-[640px]:px-3 max-[640px]:py-2.5 max-[640px]:text-[10px]"
            >
              2027 New Students Register
            </button>
            <button
              type="button"
              id="mobile-nav-toggle"
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hidden size-11 shrink-0 items-center justify-center rounded-full text-[#102c45] transition-colors hover:bg-[#edf9f3] max-[1100px]:flex"
            >
              {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-[calc(100%+8px)] hidden max-h-[calc(100dvh-110px)] overflow-y-auto rounded-[24px] border border-[#e0eee7] bg-white p-4 shadow-[0_18px_45px_-15px_rgba(12,41,68,0.2)] max-[1100px]:block"
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-current={activeTab === item.name ? "location" : undefined}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-[#f0faf5] ${activeTab === item.name ? "bg-[#edf9f3] text-[#12845b]" : "text-[#3d5069]"}`}
                onClick={() => {
                  setActiveTab(item.name);
                  setMobileMenuOpen(false);
                }}
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
