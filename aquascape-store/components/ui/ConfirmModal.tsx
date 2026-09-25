"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary" | "success";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  icon,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconContainer: "bg-red-50 text-red-600 border border-red-200",
          defaultIcon: <AlertTriangle size={22} className="text-red-600" />,
          confirmBtn:
            "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md shadow-red-600/20",
          titleText: "text-on-surface",
        };
      case "warning":
        return {
          iconContainer: "bg-amber-50 text-amber-600 border border-amber-200",
          defaultIcon: <AlertTriangle size={22} className="text-amber-600" />,
          confirmBtn:
            "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-md shadow-amber-600/20",
          titleText: "text-on-surface",
        };
      case "success":
        return {
          iconContainer: "bg-emerald-50 text-emerald-600 border border-emerald-200",
          defaultIcon: <CheckCircle2 size={22} className="text-emerald-600" />,
          confirmBtn:
            "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-md shadow-emerald-600/20",
          titleText: "text-on-surface",
        };
      case "primary":
      default:
        return {
          iconContainer: "bg-primary/10 text-primary border border-primary/20",
          defaultIcon: <Info size={22} className="text-primary" />,
          confirmBtn:
            "bg-primary hover:bg-primary-hover text-white focus:ring-primary shadow-md shadow-primary/20",
          titleText: "text-on-surface",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-background-white p-6 shadow-2xl border border-outline-variant/50 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconContainer}`}>
              {icon || styles.defaultIcon}
            </div>
            <div>
              <h3 id="confirm-modal-title" className={`font-display text-headline-sm font-bold ${styles.titleText}`}>
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 text-xs leading-relaxed text-on-surface-variant">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-outline-variant bg-background-white px-4 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-50 ${styles.confirmBtn}`}
          >
            {isLoading && (
              <svg className="h-3.5 w-3.5 animate-spin text-current" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
