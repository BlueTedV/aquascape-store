"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToast, type Toast } from "@/lib/toast-context";

const variantConfig = {
  success: {
    bg: "bg-primary",
    text: "text-on-primary",
    icon: CheckCircle2,
  },
  error: {
    bg: "bg-error",
    text: "text-on-error",
    icon: XCircle,
  },
  info: {
    bg: "bg-secondary",
    text: "text-on-secondary",
    icon: Info,
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-soft-hover ${
        config.bg
      } ${config.text} text-sm font-medium min-w-[220px] max-w-[340px] pointer-events-auto`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => removeToast(toast.id)}
        className="rounded-full p-0.5 transition-opacity opacity-80 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
