"use client";

import { useEffect, useState } from "react";
import { X, Tag } from "lucide-react";
import { getPublicPromos, type PromoVoucher } from "@/lib/api/promos";

function formatDiscount(promo: PromoVoucher): string {
  if (promo.type === "percentage") return `${promo.value}% off`;
  if (promo.type === "fixed") return `Rp${promo.value.toLocaleString("id-ID")} off`;
  if (promo.type === "shipping") return "Free shipping";
  return `${promo.value} off`;
}

export default function PromoBanner() {
  const [promo, setPromo] = useState<PromoVoucher | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getPublicPromos().then((promos) => {
      const active = promos.find((p) => p.isActive);
      if (!active) return;

      // Don't re-show if user dismissed this promo in this session
      const dismissedKey = `promo-dismissed-${active.id}`;
      if (sessionStorage.getItem(dismissedKey)) return;

      setPromo(active);
    });
  }, []);

  const handleDismiss = () => {
    if (promo) {
      sessionStorage.setItem(`promo-dismissed-${promo.id}`, "1");
    }
    setDismissed(true);
  };

  if (!promo || dismissed) return null;

  const discountText = formatDiscount(promo);
  const minText =
    promo.minSubtotal > 0
      ? ` on orders over Rp${promo.minSubtotal.toLocaleString("id-ID")}`
      : "";

  return (
    <div className="relative z-40 w-full bg-primary-container text-on-primary-container">
      <div className="mx-auto flex max-w-container items-center justify-center gap-2 px-edge-margin-mobile py-2 md:px-edge-margin-desktop">
        <Tag size={14} className="shrink-0 text-primary" />
        <p className="text-center text-xs font-semibold sm:text-sm">
          <span className="font-bold text-primary">{discountText}</span>
          {minText}
          {" — use code "}
          <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[11px] font-bold text-on-primary tracking-wider">
            {promo.code}
          </span>
          {promo.description ? ` · ${promo.description}` : ""}
        </p>
        <button
          type="button"
          aria-label="Dismiss promotion banner"
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-on-primary-container/70 transition-colors hover:text-on-primary-container sm:right-4"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
