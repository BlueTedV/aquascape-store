"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Copy, ShoppingBag, Truck, Clock, ArrowRight, ExternalLink, Printer } from "lucide-react";
import { useState } from "react";
import { Order } from "@/lib/api/orders";
import { formatIDR } from "@/lib/format";
import OrderInvoiceModal from "@/components/order/OrderInvoiceModal";

interface OrderSuccessViewProps {
  order: Order;
}

export default function OrderSuccessView({ order }: OrderSuccessViewProps) {
  const [copied, setCopied] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const steps = [
    { key: "pending", title: "Order Placed", desc: "Verified" },
    { key: "processing", title: "Processing", desc: "Packing & Plant Care" },
    { key: "shipped", title: "On The Way", desc: "Handed to Courier" },
    { key: "completed", title: "Delivered", desc: "Package Received" },
  ];

  const currentStepIndex =
    order.orderStatus === "pending"
      ? 0
      : order.orderStatus === "processing"
        ? 1
        : order.orderStatus === "shipped"
          ? 2
          : 3;

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
        {/* Left Column: Tracking & Payment Details & Items */}
        <div className="space-y-stack-md">
          {/* Live Delivery & Resi Tracking Card */}
          <div className="rounded-lg border border-primary/30 bg-background-white p-stack-md shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2 text-primary font-display text-body-lg font-bold">
                <Truck size={20} />
                <span>
                  {order.orderStatus === "completed" ? "Order Delivered & Completed" : "Live Package Tracking"}
                </span>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase">
                {order.orderStatus}
              </span>
            </div>

            {/* Resi Banner */}
            {order.trackingNumber ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-purple-50 p-4 border border-purple-200">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Shipping Resi / Waybill No.</p>
                  <p className="font-mono text-base font-bold text-purple-950 mt-0.5">{order.trackingNumber}</p>
                  <p className="text-xs text-purple-700 mt-0.5">Courier: <strong>{order.courier}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(order.trackingNumber || "");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 rounded bg-background-white px-3 py-1.5 text-xs font-bold text-purple-900 border border-purple-300 hover:bg-purple-100 shadow-xs"
                  >
                    <Copy size={13} />
                    {copied ? "Copied!" : "Copy Resi"}
                  </button>
                  <a
                    href={`https://www.cekresi.com/?noresi=${encodeURIComponent(order.trackingNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-800 shadow-xs"
                  >
                    <span>Track Live</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-surface-container-low p-3.5 text-xs text-on-surface-variant">
                Shipping Resi (Waybill) will be assigned as soon as the courier picks up your package.
              </div>
            )}

            {/* Stepper */}
            <div className="my-6 px-2">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-outline-variant/40" />
                <div
                  className="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                  const isFinished = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                          isFinished
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                            : "border-outline-variant/60 bg-background-white text-on-surface-variant"
                        } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                      >
                        {isFinished ? <CheckCircle2 size={18} /> : <Clock size={16} />}
                      </div>
                      <div className="mt-2 hidden sm:block">
                        <p className={`text-xs font-bold ${isFinished ? "text-on-surface" : "text-on-surface-variant/60"}`}>
                          {step.title}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded bg-surface-container text-label-md font-bold text-on-surface border border-outline-variant/80 transition-all hover:bg-surface-container-high hover:border-primary"
            >
              <Printer size={16} className="text-primary" />
              <span>View &amp; Print Invoice</span>
            </button>

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

      {/* Invoice Modal */}
      <OrderInvoiceModal
        order={order}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
}
