"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Copy, ShoppingBag, Truck, CreditCard, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Order } from "@/lib/api/orders";
import { formatIDR } from "@/lib/format";

interface OrderSuccessViewProps {
  order: Order;
}

export default function OrderSuccessView({ order }: OrderSuccessViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyVA = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-container px-edge-margin-mobile pb-20 pt-24 md:px-edge-margin-desktop">
      {/* Top Banner */}
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-lg bg-background-white p-stack-lg text-center shadow-soft">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="mt-4 font-display text-headline-lg text-on-surface">Thank You for Your Order!</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          We have received your order <span className="font-bold text-primary">#{order.orderNumber}</span>.
        </p>

        {/* Status Badge */}
        <div className="mt-4 flex items-center gap-2 rounded-full bg-surface-container px-4 py-1.5 text-xs font-bold text-on-surface">
          <Clock size={14} className="text-primary" />
          <span>Status: {order.orderStatus.toUpperCase()}</span>
          <span className="text-on-surface-variant">•</span>
          <span>Payment: {order.paymentStatus.toUpperCase()}</span>
        </div>
      </div>

      <div className="mx-auto mt-stack-lg grid max-w-4xl gap-gutter lg:grid-cols-[1fr_360px]">
        {/* Left Column: Payment Details & Items */}
        <div className="space-y-stack-md">
          {/* Payment Instructions Card */}
          <div className="rounded-lg border border-primary/20 bg-background-white p-stack-md shadow-soft">
            <div className="flex items-center gap-2.5 text-primary">
              <CreditCard size={20} />
              <h2 className="font-display text-body-lg font-bold text-on-surface">Payment Instructions</h2>
            </div>

            {order.paymentMethod === "bank_transfer" && (
              <div className="mt-stack-sm space-y-4">
                <p className="text-xs text-on-surface-variant">
                  Please transfer the exact amount below to complete your order verification:
                </p>

                <div className="rounded-lg bg-surface-container-low p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-on-surface-variant">Bank Central Asia (BCA)</p>
                      <p className="mt-0.5 font-mono text-lg font-bold text-on-surface">8830-192-881</p>
                      <p className="text-xs text-on-surface-variant">a.n. PT Aquaku Store Indonesia</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyVA("8830192881")}
                      className="flex items-center gap-1.5 rounded border border-outline-variant/60 bg-background-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-surface-container"
                    >
                      <Copy size={13} />
                      {copied ? "Copied!" : "Copy Number"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between rounded-lg bg-primary/5 p-3 text-xs text-on-surface">
                  <span>Total Amount to Pay:</span>
                  <span className="font-sans text-sm font-bold text-price-green">{formatIDR(order.totalAmount)}</span>
                </div>
              </div>
            )}

            {order.paymentMethod === "qris" && (
              <div className="mt-stack-sm text-center">
                <p className="text-xs text-on-surface-variant">
                  Scan the QRIS code below using your preferred payment app (GoPay, OVO, ShopeePay, BCA):
                </p>
                <div className="my-4 flex justify-center">
                  <div className="rounded-lg border bg-background-white p-3 shadow-sm">
                    {/* Mock QR code container */}
                    <div className="flex h-44 w-44 items-center justify-center rounded bg-surface-container font-mono text-xs text-on-surface-variant">
                      [ QRIS CODE ]
                    </div>
                  </div>
                </div>
                <p className="font-sans text-sm font-bold text-price-green">{formatIDR(order.totalAmount)}</p>
              </div>
            )}

            {order.paymentMethod === "cod" && (
              <div className="mt-stack-sm">
                <p className="text-xs text-on-surface-variant">
                  Your order will be processed and delivered via COD. Please prepare exact cash of{" "}
                  <strong className="text-primary">{formatIDR(order.totalAmount)}</strong> upon courier arrival.
                </p>
              </div>
            )}
          </div>

          {/* Purchased Items List */}
          <div className="rounded-lg bg-background-white p-stack-md shadow-soft">
            <h2 className="font-display text-body-lg font-bold text-on-surface">Items Ordered ({order.items.length})</h2>

            <div className="mt-stack-sm divide-y divide-outline-variant/40">
              {order.items.map((item) => {
                const imageSrc =
                  !item.productImage ||
                  item.productImage.includes("picsum.photos") ||
                  item.productImage.includes("fastly.picsum.photos")
                    ? "/images/products/product-placeholder.svg"
                    : item.productImage;

                return (
                  <div key={item.id} className="flex gap-4 py-3.5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-surface-container">
                      <Image src={imageSrc} alt={item.productName} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${item.productSlug}`}>
                        <h3 className="line-clamp-1 font-display text-sm font-bold text-on-surface hover:text-primary">
                          {item.productName}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Qty: {item.quantity} x {formatIDR(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-sans text-sm font-bold text-on-surface">{formatIDR(item.subtotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Destination Summary & Actions */}
        <aside className="h-fit space-y-stack-md">
          <div className="rounded-lg bg-background-white p-stack-md shadow-soft">
            <h2 className="font-display text-body-lg font-bold text-on-surface">Delivery Address</h2>

            <div className="mt-stack-sm space-y-2 text-xs text-on-surface-variant">
              <p className="font-bold text-on-surface">{order.customerName}</p>
              <p>{order.customerPhone}</p>
              <p>{order.customerEmail}</p>
              <p className="pt-2 text-on-surface">
                {order.shippingAddress}, {order.shippingCity}, {order.shippingPostalCode}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-primary font-medium">
                <Truck size={14} />
                <span>Courier: {order.courier}</span>
              </div>
            </div>

            <div className="mt-stack-md border-t border-outline-variant/40 pt-4 space-y-2 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-on-surface">{formatIDR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-on-surface">{order.shippingCost === 0 ? "FREE" : formatIDR(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-on-surface border-t border-outline-variant/40">
                <span>Total</span>
                <span className="font-sans text-price-green">{formatIDR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/shop"
              className="flex h-11 w-full items-center justify-center gap-2 rounded bg-primary text-label-md text-on-primary transition-colors hover:bg-primary-container"
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>

            <Link
              href="/manage"
              className="flex h-11 w-full items-center justify-center gap-2 rounded border border-outline-variant/60 bg-background-white text-label-md text-on-surface transition-colors hover:bg-surface-container"
            >
              <span>View in Admin Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
