"use client";

import { useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxHeight = "max-h-[85vh]",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when sheet is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center md:hidden"
    >
      {/* Dimmed & Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-Up Sheet Container */}
      <div
        ref={sheetRef}
        className={`relative z-10 flex w-full flex-col rounded-t-2xl border-t border-outline-variant/40 bg-background-white shadow-2xl ${maxHeight} animate-in slide-in-from-bottom duration-300 ease-out`}
      >
        {/* Drag Handle Indicator */}
        <div className="flex w-full items-center justify-center pt-3 pb-1">
          <span className="h-1.5 w-12 rounded-full bg-outline-variant/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-3.5">
          <div>
            <h2 className="font-display text-base font-bold text-on-surface">{title}</h2>
            {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="Close sheet"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain no-scrollbar">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="border-t border-outline-variant/30 bg-background-white px-5 py-3.5 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
