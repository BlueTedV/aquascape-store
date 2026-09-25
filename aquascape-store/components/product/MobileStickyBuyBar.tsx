"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingCart, Zap, Check } from "lucide-react";
import { ProductDetail } from "@/lib/api/products";
import { formatIDR } from "@/lib/format";
import BottomSheet from "@/components/ui/BottomSheet";

interface MobileStickyBuyBarProps {
  product: ProductDetail;
  onAddToCart: (quantity: number) => Promise<boolean>;
  favorited: boolean;
  onToggleWishlist: () => void;
}

export default function MobileStickyBuyBar({
  product,
  onAddToCart,
  favorited,
  onToggleWishlist,
}: MobileStickyBuyBarProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"cart" | "buy">("cart");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const subtotal = product.price * quantity;

  const openSheet = (mode: "cart" | "buy") => {
    setSheetMode(mode);
    setIsSheetOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    const success = await onAddToCart(quantity);
    setIsSubmitting(false);

    if (!success) return;

    if (sheetMode === "buy") {
      setIsSheetOpen(false);
      router.push("/cart");
    } else {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2000);
      setIsSheetOpen(false);
    }
  };

  return (
    <>
      {/* FIXED BOTTOM ACTION BAR (Mobile & Tablet < lg) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/40 bg-background-white/95 px-3 py-2.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          {/* Wishlist Button */}
          <button
            type="button"
            aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
            onClick={onToggleWishlist}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95 ${
              favorited
                ? "border-rose-300 bg-rose-50 text-rose-500 shadow-xs"
                : "border-outline-variant/80 bg-surface-container-low text-on-surface-variant hover:text-rose-500"
            }`}
          >
            <Heart size={20} className={favorited ? "fill-rose-500 text-rose-500" : ""} />
          </button>

          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="flex-1 rounded-xl bg-surface-container-high py-3 text-center text-xs font-bold uppercase text-on-surface-variant/60"
            >
              Out of Stock
            </button>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              {/* Add to Cart Secondary CTA */}
              <button
                type="button"
                onClick={() => openSheet("cart")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-xs font-bold uppercase text-primary transition-all active:scale-[0.98]"
              >
                {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                <span>{added ? "Added!" : "Add to Cart"}</span>
              </button>

              {/* Buy Now Primary CTA */}
              <button
                type="button"
                onClick={() => openSheet("buy")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold uppercase text-on-primary shadow-xs transition-all hover:bg-primary-container active:scale-[0.98]"
              >
                <Zap size={16} />
                <span>Buy Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QUANTITY & PURCHASE BOTTOM SHEET */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={sheetMode === "buy" ? "Instant Checkout" : "Select Quantity"}
        subtitle={product.name}
        footer={
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                Total Price
              </span>
              <p className="font-mono text-base font-bold text-price-green">
                {formatIDR(subtotal)}
              </p>
            </div>
            <button
              type="button"
              disabled={isSubmitting || isOutOfStock}
              onClick={handleConfirmAction}
              className="flex flex-2 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase text-on-primary shadow-xs transition-all hover:bg-primary-container disabled:opacity-50"
            >
              {isSubmitting ? (
                "Processing..."
              ) : sheetMode === "buy" ? (
                <>
                  <Zap size={15} />
                  <span>Proceed to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  <span>Confirm Add to Cart</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Product Snippet Header */}
          <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3 border border-outline-variant/40">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 font-display text-sm font-bold text-on-surface">
                {product.name}
              </h3>
              <p className="mt-0.5 font-mono text-xs font-bold text-price-green">
                {formatIDR(product.price)}
                {product.unit && (
                  <span className="font-sans text-[11px] font-normal text-on-surface-variant">
                    {" "}/ {product.unit}
                  </span>
                )}
              </p>
              <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                Ready Stock ({product.stock} available)
              </p>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between rounded-xl border border-outline-variant/50 p-4">
            <div>
              <span className="text-xs font-bold text-on-surface">Quantity</span>
              <p className="text-[11px] text-on-surface-variant">
                Max {product.stock} {product.unit || "units"} per order
              </p>
            </div>

            <div className="flex h-10 items-center gap-2 rounded-lg bg-surface-container-high/60 p-1">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-background-white hover:text-primary disabled:opacity-40"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-mono text-sm font-bold text-on-surface">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((v) => Math.min(product.stock, v + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-background-white hover:text-primary disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
