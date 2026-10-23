"use client";

import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Award,
  BookOpen,
  MessageCircle,
  Sparkles,
} from "lucide-react";

interface FooterProps {
  onOpenLogin: () => void;
  onOpenJoin: () => void;
}

export default function Footer({ onOpenLogin, onOpenJoin }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0f172a] text-[#94a3b8] pt-15 pb-7.5 relative" id="contact">
      {/* Pre-footer Call to Action Banner */}
      <div className="w-full max-w-[var(--container-max)] ml-auto mr-auto pl-6 pr-6 max-[640px]:pl-4 max-[640px]:pr-4">
        <div className="bg-[linear-gradient(135deg,_#1e3a8a_0%,_#1d4ed8_50%,_#0284c7_100%)] rounded-[24px] p-10 flex items-center justify-between text-[#ffffff] mb-15 [box-shadow:0_20px_45px_-10px_rgba(29,_78,_216,_0.45)] flex-wrap gap-6 max-[640px]:pt-6 max-[640px]:pb-6 max-[640px]:pl-5 max-[640px]:pr-5">
          <div className="max-w-[600px]">
            <span className="inline-flex items-center gap-1.5 [background:rgba(254,_240,_138,_0.2)] [border:1px_solid_rgba(254,_240,_138,_0.5)] text-[#fef08a] text-[length:0.72rem] font-extrabold tracking-[1px] pt-1 pb-1 pl-3 pr-3 rounded-full mb-3.5">
              <Sparkles size={14} /> ADMISSIONS OPEN FOR 2026 &amp; 2027 O/L
            </span>
            <h2 className="text-[length:1.85rem] font-[850] leading-[1.25] text-[#ffffff] mb-2 max-[640px]:text-[length:1.4rem]">
              Start Your O/L Commerce Journey Today
            </h2>
            <p className="text-[length:0.95rem] text-[#e0f2fe] leading-[1.5]">
              Join over 5,000+ ambitious commerce students across Sri Lanka guided by Evon Aravinda.
            </p>
          </div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <button
              type="button"
              onClick={onOpenJoin}
              className="bg-[#ffffff] text-[#1d4ed8] text-[length:0.98rem] font-bold pt-[13px] pb-[13px] pl-6.5 pr-6.5 rounded-full [box-shadow:0_6px_18px_rgba(0,_0,_0,_0.2)] [transition:all_0.2s_ease] cursor-pointer hover:bg-[#f8fafc] hover:[transform:translateY(-2px)] hover:[box-shadow:0_10px_24px_rgba(0,_0,_0,_0.3)]"
            >
              Register for Classes ➔
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="[background:rgba(255,_255,_255,_0.15)] [backdrop-filter:blur(8px)] [border:1.5px_solid_rgba(255,_255,_255,_0.4)] text-[#ffffff] text-[length:0.98rem] font-bold pt-3 pb-3 pl-6 pr-6 rounded-full [transition:all_0.2s_ease] cursor-pointer hover:[background:rgba(255,_255,_255,_0.25)] hover:[transform:translateY(-2px)]"
            >
              Student LMS Login
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[var(--container-max)] ml-auto mr-auto pl-6 pr-6 max-[640px]:pl-4 max-[640px]:pr-4">
        <div className="grid grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-10 pb-12.5 [border-bottom:1px_solid_rgba(255,_255,_255,_0.1)] max-[1024px]:grid-cols-[repeat(2,_1fr)] max-[640px]:grid-cols-[1fr]">
          {/* Col 1: Brand Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4.5">
              <div className="flex items-center justify-center">
                <svg
                  width="36"
                  height="34"
                  viewBox="0 0 34 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="16" width="6" height="14" rx="2" fill="#F59E0B" />
                  <rect x="11" y="9" width="6" height="21" rx="2" fill="#D97706" />
                  <rect x="20" y="2" width="6" height="28" rx="2" fill="#B45309" />
                  <path
                    d="M4 14L13 7L21 1.5L30 1.5M30 1.5V9M30 1.5L22 9"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="text-[length:1.25rem] font-black leading-[1.1]">
                  <span className="text-[#fbbf24]">ACCESS TO </span>
                  <span className="text-[#f59e0b]">SUCCESS</span>
                </div>
                <div className="text-[length:0.68rem] font-bold tracking-[1px] text-[#cbd5e1] uppercase">with EVON ARAVINDA</div>
              </div>
            </div>

            <p className="text-[length:0.88rem] leading-[1.6] text-[#94a3b8] mb-5">
              Sri Lanka&apos;s premier Commerce education platform offering world-class G.C.E. Ordinary Level Business & Accounting Studies instruction.
            </p>

            <div className="text-[length:0.72rem] font-extrabold tracking-[1.5px] text-[#38bdf8] [background:rgba(56,_189,_248,_0.1)] pt-2 pb-2 pl-3.5 pr-3.5 rounded-[8px] w-[fit-content] [border:1px_solid_rgba(56,_189,_248,_0.2)] [&_span]:text-[#e0f2fe]">
              <span>DISCIPLINE</span> • <span>CONCEPT</span> • <span>PRACTICE</span> • <span>RESULTS</span>
            </div>
          </div>

          {/* Col 2: Academic Programs */}
          <div >
            <h4 className="text-[length:1.02rem] font-extrabold text-[#ffffff] mb-5 tracking-[-0.2px]">Academic Programs</h4>
            <ul className="list-none flex flex-col gap-3 [&_a]:text-[length:0.88rem] [&_a]:text-[#94a3b8] [&_a]:[transition:color_0.2s_ease,_transform_0.2s_ease] [&_a]:inline-block [&_a:hover]:text-[#38bdf8] [&_a:hover]:[transform:translateX(3px)]">
              <li><a href="#courses">2026 O/L Business & Accounting Studies</a></li>
              <li><a href="#courses">2026 O/L Commerce Theory</a></li>
              <li><a href="#courses">2026 O/L Accounting Practice</a></li>
              <li><a href="#courses">2025 O/L Speed Revision &amp; Papers</a></li>
              <li><a href="#courses">2027 O/L Foundation Batch</a></li>
              <li><a href="#courses">Complete O/L Commerce Study Package</a></li>
            </ul>
          </div>

          {/* Col 3: Class Locations & Branches */}
          <div >
            <h4 className="text-[length:1.02rem] font-extrabold text-[#ffffff] mb-5 tracking-[-0.2px]">Lecture Locations</h4>
            <ul className="list-none flex flex-col gap-3 [&_li]:text-[length:0.84rem] [&_li]:leading-[1.45] [&_li]:text-[#94a3b8] [&_strong]:text-[#e2e8f0]">
              <li>
                <strong>Colombo:</strong> Rotary Hall &amp; Sasip (Nugegoda)
              </li>
              <li>
                <strong>Kandy:</strong> Sipsewana Hall, William Gopallawa Mawatha
              </li>
              <li>
                <strong>Galle:</strong> Dakuna Hall, Karapitiya
              </li>
              <li>
                <strong>Islandwide Online:</strong> Live Zoom + HD Cloud LMS + Doorstep Printed Books
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotlines */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[length:1.02rem] font-extrabold text-[#ffffff] mb-5 tracking-[-0.2px]">Admissions &amp; Support</h4>
            <div className="flex items-start gap-3">
              <Phone size={17} className="text-[#38bdf8] mt-[3px] shrink-0" />
              <div>
                <div className="text-[length:0.72rem] text-[#64748b] uppercase font-bold tracking-[0.5px]">Hotline / Inquiries</div>
                <div className="text-[length:0.88rem] text-[#f1f5f9] font-semibold mt-0.5">+94 77 123 4567</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle size={17} className="text-[#38bdf8] mt-[3px] shrink-0" />
              <div>
                <div className="text-[length:0.72rem] text-[#64748b] uppercase font-bold tracking-[0.5px]">WhatsApp Coordinator</div>
                <div className="text-[length:0.88rem] text-[#f1f5f9] font-semibold mt-0.5">+94 71 987 6543</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={17} className="text-[#38bdf8] mt-[3px] shrink-0" />
              <div>
                <div className="text-[length:0.72rem] text-[#64748b] uppercase font-bold tracking-[0.5px]">Student Inquiries</div>
                <div className="text-[length:0.88rem] text-[#f1f5f9] font-semibold mt-0.5">info@accesstosuccess.lk</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={17} className="text-[#38bdf8] mt-[3px] shrink-0" />
              <div>
                <div className="text-[length:0.72rem] text-[#64748b] uppercase font-bold tracking-[0.5px]">Support Hours</div>
                <div className="text-[length:0.88rem] text-[#f1f5f9] font-semibold mt-0.5">Daily 8:00 AM - 8:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-6 text-[length:0.82rem] text-[#64748b] flex-wrap gap-3.5 max-[640px]:flex-col max-[640px]:text-center">
          <div >
            © 2026 Access to Success with Evon Aravinda. All rights reserved.
          </div>
          <div className="flex items-center gap-3 [&_a]:text-[#94a3b8] [&_a]:[transition:color_0.2s_ease] [&_a:hover]:text-[#ffffff]">
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Enrollment</a>
            <span>•</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 [background:rgba(255,_255,_255,_0.08)] text-[#e2e8f0] pt-1.5 pb-1.5 pl-3 pr-3 rounded-full text-[length:0.78rem] font-semibold cursor-pointer [transition:all_0.2s_ease] hover:[background:rgba(255,_255,_255,_0.16)] hover:text-[#ffffff]"
              aria-label="Back to top"
            >
              Back to Top <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
