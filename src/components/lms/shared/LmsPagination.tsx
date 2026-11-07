"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface LmsPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  className?: string;
}

export default function LmsPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemName = "records",
  className = "",
}: LmsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate smart visible page numbers
  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (safeCurrentPage < totalPages - 2) {
        pages.push("...");
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#cddce5]/60 text-xs ${className}`}
    >
      {/* Left: Summary & Per-page selector */}
      <div className="flex flex-wrap items-center gap-2 text-[#60768a] font-bold">
        <span>
          Showing <strong className="text-[#102c45]">{startIndex}</strong> -{" "}
          <strong className="text-[#102c45]">{endIndex}</strong> of{" "}
          <strong className="text-[#007fb8]">{totalItems}</strong> {itemName}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-[#cddce5] pl-3">
            <span className="text-[11px] text-[#94a3b8]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-xl border border-[#cddce5] bg-[#edf2f3]/50 py-1 px-2 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none cursor-pointer text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 select-none">
          {/* First Page */}
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => onPageChange(1)}
            className="flex size-7 items-center justify-center rounded-xl border border-[#cddce5] bg-white text-[#102c45] hover:bg-[#edf2f3] hover:border-[#007fb8] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
            title="First Page"
          >
            <ChevronsLeft size={13} />
          </button>

          {/* Prev Page */}
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => onPageChange(safeCurrentPage - 1)}
            className="flex size-7 items-center justify-center rounded-xl border border-[#cddce5] bg-white text-[#102c45] hover:bg-[#edf2f3] hover:border-[#007fb8] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
            title="Previous Page"
          >
            <ChevronLeft size={13} />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 px-1">
            {visiblePages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex size-7 items-center justify-center text-[#94a3b8] font-bold"
                  >
                    &hellip;
                  </span>
                );
              }
              const isCurrent = p === safeCurrentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(p as number)}
                  className={`flex size-7 items-center justify-center rounded-xl font-black text-xs transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#007fb8] text-white shadow-xs scale-105"
                      : "border border-[#cddce5] bg-white text-[#102c45] hover:bg-[#edf2f3] hover:border-[#007fb8]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => onPageChange(safeCurrentPage + 1)}
            className="flex size-7 items-center justify-center rounded-xl border border-[#cddce5] bg-white text-[#102c45] hover:bg-[#edf2f3] hover:border-[#007fb8] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
            title="Next Page"
          >
            <ChevronRight size={13} />
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className="flex size-7 items-center justify-center rounded-xl border border-[#cddce5] bg-white text-[#102c45] hover:bg-[#edf2f3] hover:border-[#007fb8] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
            title="Last Page"
          >
            <ChevronsRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
