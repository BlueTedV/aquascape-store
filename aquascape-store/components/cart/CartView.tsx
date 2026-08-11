"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatIDR } from "@/lib/format";

const SHIPPING_FLAT_RATE = 25000;
const FREE_SHIPPING_THRESHOLD = 500000;

export default function CartView() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    isHydrated,
  } = useCart();

  const shipping =
    items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;

  // Avoid flashing an "empty cart" state before localStorage has been read.
  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-container px-edge-margin-mobile pb-20 pt-24 md:px-edge-margin-desktop">
        <div className="h-72 animate-pulse rounded-lg bg-background-white shadow-soft" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-container px-edge-margin-mobile pb-20 pt-24 md:px-edge-margin-desktop">
        <Breadcrumb />
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-lg bg-background-white p-stack-lg text-center shadow-soft">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-primary">
            <ShoppingBag size={28} />
          </div>
          <h1 className="mt-stack-md font-display text-headline-lg text-on-surface">
            Your cart is empty
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Looks like you haven&apos;t added any plants, hardscape, or livestock yet.
          </p>
          <Link
            href="/shop"
            className="mt-stack-md rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-edge-margin-mobile pb-20 pt-24 md:px-edge-margin-desktop">
      <Breadcrumb />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-headline-lg text-on-surface">Your Cart</h1>
        <p className="text-sm text-on-surface-variant">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="mt-stack-lg grid gap-gutter lg:grid-cols-[1fr_360px]">
        <div className="space-y-stack-md">
          {items.map((item) => {
            const imageSrc =
              !item.image ||
              item.image.includes("picsum.photos") ||
              item.image.includes("fastly.picsum.photos")
                ? "/images/products/product-placeholder.svg"
                : item.image;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-lg bg-background-white p-4 shadow-soft sm:flex-row sm:items-center"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-md bg-surface-container"
                >
                  <Image
                    src={imageSrc}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>

              <div className="min-w-0 flex-1">
                {item.category && (
                  <p className="text-[11px] uppercase text-on-surface-variant">
                    {item.category}
                  </p>
                )}
                <Link href={`/product/${item.slug}`}>
                  <h3 className="mt-0.5 line-clamp-1 font-display text-body-lg font-bold text-on-surface hover:text-primary">
                    {item.name}
                  </h3>
                </Link>
                <p className="mt-1 font-sans text-sm font-bold text-price-green">
                  {formatIDR(item.price)}
                  {item.unit && (
                    <span className="ml-1 text-xs font-normal text-on-surface-variant">
                      / {item.unit}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-3">
                <div className="flex h-10 items-center rounded bg-surface-container-low px-1">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant hover:bg-background-white hover:text-primary"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-on-surface">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant hover:bg-background-white hover:text-primary"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-sans text-sm font-bold text-on-surface">
                    {formatIDR(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeItem(item.id)}
                    className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              href="/shop"
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-bold text-on-surface-variant transition-colors hover:text-error"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <aside className="h-fit rounded-lg bg-background-white p-stack-md shadow-soft lg:sticky lg:top-32">
          <h2 className="font-display text-body-lg font-bold text-on-surface">
            Order Summary
          </h2>

          <div className="mt-stack-md space-y-3 border-b border-outline-variant/40 pb-stack-md text-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span className="font-bold text-on-surface">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Shipping</span>
              <span className="font-bold text-on-surface">
                {shipping === 0 ? "Free" : formatIDR(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-on-surface-variant">
                Add {formatIDR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
              </p>
            )}
          </div>

          <div className="mt-stack-md flex items-center justify-between">
            <span className="font-display text-body-lg font-bold text-on-surface">
              Total
            </span>
            <span className="font-sans text-price-display text-price-green">
              {formatIDR(total)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-stack-md flex h-12 w-full items-center justify-center rounded bg-primary text-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Proceed to Checkout
          </Link>

          <p className="mt-3 text-center text-xs text-on-surface-variant">
            Taxes calculated at checkout. Ships safely within 24 hours.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav className="mb-6 flex items-center gap-2 text-xs text-on-surface-variant">
      <Link href="/" className="hover:text-primary">
        Home
      </Link>
      <span>/</span>
      <span className="font-bold text-primary">Cart</span>
    </nav>
  );
}
