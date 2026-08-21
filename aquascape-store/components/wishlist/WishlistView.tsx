"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight, Check, Sparkles } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { useAuthCart } from "@/lib/use-auth-cart";
import ProductCard from "@/components/ui/ProductCard";

export default function WishlistView() {
  const { items, isHydrated, clearWishlist, itemCount } = useWishlist();
  const { addItem } = useAuthCart();
  const [addAllState, setAddAllState] = useState<"idle" | "adding" | "done">("idle");

  const handleAddAllToCart = async () => {
    if (items.length === 0) return;
    setAddAllState("adding");

    for (const item of items) {
      await addItem({
        id: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      });
    }

    setAddAllState("done");
    setTimeout(() => setAddAllState("idle"), 2500);
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-container px-edge-margin-mobile py-24 md:px-edge-margin-desktop">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-container mb-6" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-lg bg-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-edge-margin-mobile pb-24 pt-24 md:px-edge-margin-desktop">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b border-outline-variant/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold">
            <Heart size={22} className="fill-rose-500 text-rose-500" />
            <span className="font-sans text-xs uppercase tracking-widest text-on-surface-variant font-bold">
              My Saved Items
            </span>
          </div>
          <h1 className="mt-1 font-display text-display-md font-bold text-on-surface">
            Wishlist & Favorites
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {itemCount > 0
              ? `You have saved ${itemCount} item${itemCount === 1 ? "" : "s"} for your next aquascape build.`
              : "Save items you love so you can easily purchase them later."}
          </p>
        </div>

        {itemCount > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddAllToCart}
              disabled={addAllState === "adding"}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:opacity-50"
            >
              {addAllState === "done" ? (
                <>
                  <Check size={16} />
                  <span>All Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add All to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearWishlist}
              className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-background-white px-4 py-2.5 text-xs font-bold text-on-surface-variant transition-colors hover:border-red-300 hover:text-red-600"
            >
              <Trash2 size={15} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {itemCount === 0 ? (
        <div className="my-16 flex flex-col items-center justify-center rounded-2xl bg-background-white p-12 text-center shadow-soft">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Heart size={40} className="stroke-[1.5]" />
          </div>
          <h2 className="mt-5 font-display text-headline-sm font-bold text-on-surface">
            Your Wishlist is Empty
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
            Explore our curated catalog of aquatic plants, hardscape rocks, driftwood, and high-clarity tanks. Click the heart icon on any product to save it here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-on-primary shadow-sm hover:bg-primary-container"
            >
              <ShoppingBag size={16} />
              <span>Browse Shop Catalog</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-6 py-3 text-xs font-bold text-on-surface hover:bg-surface-container"
            >
              <Sparkles size={16} className="text-primary" />
              <span>Use Tank Calculator</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
