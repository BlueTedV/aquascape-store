"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Truck,
  ShieldCheck,
  AlertCircle,
  Loader2,
  QrCode,
  ArrowRight,
  Package,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatIDR } from "@/lib/format";
import { createCheckoutOrder, Order } from "@/lib/api/orders";
import { getCurrentAccount } from "@/lib/api/auth";
import MidtransSnapScript from "@/components/checkout/MidtransSnapScript";

const COURIERS = [
  {
    id: "standard",
    name: "Standard Courier (JNE / SiCepat)",
    eta: "2-3 business days",
    price: 25000,
  },
  {
    id: "express",
    name: "Express Delivery (GoSend / GrabExpress)",
    eta: "Same day delivery",
    price: 45000,
  },
  {
    id: "cargo",
    name: "Aquascape Freight & Live Stock Handler",
    eta: "1-2 days (Temperature-Controlled)",
    price: 60000,
  },
];

const PAYMENT_METHODS = [
  {
    id: "bank_transfer",
    name: "Virtual Account (Midtrans Payment)",
    description: "Instant automatic verification via BCA, Mandiri, BNI, or BRI VA",
    icon: CreditCard,
    badge: "Midtrans VA",
  },
  {
    id: "qris",
    name: "QRIS / E-Wallet (Midtrans Instant)",
    description: "Scan QR code using GoPay, OVO, ShopeePay, Dana, or Bank Apps",
    icon: QrCode,
    badge: "Midtrans QRIS",
  },
  {
    id: "credit_card",
    name: "Credit / Debit Card (Powered by Midtrans)",
    description: "Secured 3D-Secure payment using Visa, Mastercard, or JCB",
    icon: CreditCard,
    badge: "Midtrans Card",
  },
  {
    id: "cod",
    name: "Cash on Delivery (COD)",
    description: "Pay cash upon arrival (Jabodetabek region only)",
    icon: Truck,
    badge: "Pay on Delivery",
  },
];

const FREE_SHIPPING_THRESHOLD = 500000;

export default function CheckoutView() {
  const router = useRouter();
  const { items, subtotal, clearCart, isHydrated } = useCart();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostalCode: "",
    courier: "standard",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedMessage, setFailedMessage] = useState<string>("");

  // Auto-fill logged in user account info
  useEffect(() => {
    getCurrentAccount()
      .then((account) => {
        if (!account) return;
        setFormData((prev) => ({
          ...prev,
          customerName: prev.customerName || account.profile?.fullName || account.user.fullName || "",
          customerEmail: prev.customerEmail || account.user.email || "",
          customerPhone:
            prev.customerPhone || account.profile?.phone || account.shippingAddress?.phone || account.user.phone || "",
          shippingAddress:
            prev.shippingAddress ||
            (account.shippingAddress?.addressLine1
              ? `${account.shippingAddress.addressLine1}${
                  account.shippingAddress.addressLine2 ? ", " + account.shippingAddress.addressLine2 : ""
                }`
              : ""),
          shippingCity: prev.shippingCity || account.shippingAddress?.city || "",
          shippingPostalCode: prev.shippingPostalCode || account.shippingAddress?.postalCode || "",
        }));
      })
      .catch(() => {
        // Guest checkout mode
      });
  }, []);

  // Selected courier price
  const selectedCourierObj = COURIERS.find((c) => c.id === formData.courier) || COURIERS[0];
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD && formData.courier === "standard" ? 0 : selectedCourierObj.price;
  const grandTotal = subtotal + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openSnapPayment = (order: Order): Promise<"success" | "pending" | "error" | "close"> => {
    return new Promise((resolve) => {
      const snapToken = order.midtransSnapToken;

      if (!snapToken) {
        resolve("error");
        return;
      }

      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => resolve("success"),
          onPending: () => resolve("pending"),
          onError: () => resolve("error"),
          onClose: () => resolve("close"),
        });
      } else if (order.midtransRedirectUrl) {
        // Fallback: open redirect URL and treat as pending
        window.open(order.midtransRedirectUrl, "_blank");
        resolve("pending");
      } else {
        resolve("error");
      }
    });
  };

  const handleRetryPayment = async () => {
    if (!createdOrder) return;
    setShowFailedModal(false);

    const result = await openSnapPayment(createdOrder);
    if (result === "success" || result === "pending") {
      setShowSuccessModal(true);
    } else {
      setFailedMessage(
        result === "close"
          ? "You closed the payment window before completing the transaction."
          : "The payment could not be processed. Please try again."
      );
      setShowFailedModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowFailedModal(false);
    setShowSuccessModal(false);

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setIsLoading(true);

    try {
      const order = await createCheckoutOrder({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingPostalCode: formData.shippingPostalCode,
        courier: selectedCourierObj.name,
        shippingCost,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      clearCart();
      setCreatedOrder(order);

      // For Midtrans payment methods, open Snap FIRST — user must pay before seeing success
      const isMidtrans = ["bank_transfer", "qris", "credit_card"].includes(order.paymentMethod);

      if (isMidtrans && order.midtransSnapToken) {
        setIsLoading(false);
        const result = await openSnapPayment(order);

        if (result === "success" || result === "pending") {
          setShowSuccessModal(true);
        } else {
          setFailedMessage(
            result === "close"
              ? "You closed the payment window before completing the transaction."
              : "The payment could not be processed. Please try again."
          );
          setShowFailedModal(true);
        }
      } else {
        // COD or no Midtrans token — show success directly
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong while placing your order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-container px-edge-margin-mobile pb-20 pt-24 md:px-edge-margin-desktop">
        <div className="h-96 animate-pulse rounded-lg bg-background-white shadow-soft" />
      </div>
    );
  }

  if (items.length === 0 && !showSuccessModal && !showFailedModal && !createdOrder) {
    return (
      <div className="mx-auto max-w-container px-edge-margin-mobile pb-20 pt-24 md:px-edge-margin-desktop">
        <Breadcrumb />
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-lg bg-background-white p-stack-lg text-center shadow-soft">
          <h1 className="font-display text-headline-lg text-on-surface">Your cart is empty</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="mt-stack-md rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-edge-margin-mobile pb-20 pt-24 md:px-edge-margin-desktop">
      <MidtransSnapScript />
      <Breadcrumb />

      <h1 className="font-display text-headline-lg text-on-surface">Checkout</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Complete your order details below to receive your aquascaping essentials.
      </p>

      {errorMessage && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-error/20 bg-error-container/30 p-4 text-error">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-stack-lg grid gap-gutter lg:grid-cols-[1fr_420px]">
        {/* Left Column: Form Sections */}
        <div className="space-y-stack-md">
          {/* Section 1: Customer Contact Info */}
          <div className="rounded-lg bg-background-white p-stack-md shadow-soft">
            <h2 className="font-display text-body-lg font-bold text-on-surface">
              1. Customer Information
            </h2>

            <div className="mt-stack-sm grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="e.g. Budi Santoso"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  placeholder="name@example.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Phone Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  required
                  placeholder="e.g. 081234567890"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Destination */}
          <div className="rounded-lg bg-background-white p-stack-md shadow-soft">
            <h2 className="font-display text-body-lg font-bold text-on-surface">
              2. Shipping Address
            </h2>

            <div className="mt-stack-sm space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Street Address *
                </label>
                <textarea
                  name="shippingAddress"
                  required
                  rows={3}
                  placeholder="Street name, building number, apartment/suite number"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    City / District *
                  </label>
                  <input
                    type="text"
                    name="shippingCity"
                    required
                    placeholder="e.g. Jakarta Selatan"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="shippingPostalCode"
                    required
                    placeholder="e.g. 12190"
                    value={formData.shippingPostalCode}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Courier Selection */}
          <div className="rounded-lg bg-background-white p-stack-md shadow-soft">
            <h2 className="font-display text-body-lg font-bold text-on-surface">
              3. Select Shipping Courier
            </h2>

            <div className="mt-stack-sm space-y-3">
              {COURIERS.map((courier) => {
                const isFree = subtotal >= FREE_SHIPPING_THRESHOLD && courier.id === "standard";
                const isSelected = formData.courier === courier.id;

                return (
                  <label
                    key={courier.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-outline-variant/60 bg-surface-container-low hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courier"
                        value={courier.id}
                        checked={isSelected}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="text-sm font-bold text-on-surface">{courier.name}</p>
                        <p className="text-xs text-on-surface-variant">{courier.eta}</p>
                      </div>
                    </div>
                    <span className="font-sans text-sm font-bold text-primary">
                      {isFree ? "FREE" : formatIDR(courier.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Payment Method (Prepared for Midtrans) */}
          <div className="rounded-lg bg-background-white p-stack-md shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-body-lg font-bold text-on-surface">
                4. Payment Method
              </h2>
              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                <Sparkles size={12} /> Midtrans Ready
              </span>
            </div>

            <div className="mt-stack-sm space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const IconComponent = method.icon;
                const isSelected = formData.paymentMethod === method.id;

                return (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-outline-variant/60 bg-surface-container-low hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={isSelected}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <IconComponent size={18} className="text-primary" />
                          <span className="text-sm font-bold text-on-surface">{method.name}</span>
                        </div>
                        <span className="rounded border border-outline-variant/60 bg-surface-container px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
                          {method.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">{method.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 5: Order Notes */}
          <div className="rounded-lg bg-background-white p-stack-md shadow-soft">
            <h2 className="font-display text-body-lg font-bold text-on-surface">
              5. Order Notes (Optional)
            </h2>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Please wrap live plants with extra insulation, or leave with security."
              value={formData.notes}
              onChange={handleChange}
              className="mt-stack-sm w-full rounded border border-outline-variant/60 bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <aside className="h-fit space-y-stack-md lg:sticky lg:top-32">
          <div className="rounded-lg bg-background-white p-stack-md shadow-soft">
            <h2 className="font-display text-body-lg font-bold text-on-surface">Order Summary</h2>

            {/* Cart Items List */}
            <div className="mt-stack-sm max-h-80 divide-y divide-outline-variant/40 overflow-y-auto pr-1">
              {items.map((item) => {
                const imageSrc =
                  !item.image ||
                  item.image.includes("picsum.photos") ||
                  item.image.includes("fastly.picsum.photos")
                    ? "/images/products/product-placeholder.svg"
                    : item.image;

                return (
                  <div key={item.id} className="flex gap-3 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-surface-container">
                      <Image src={imageSrc} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-bold text-on-surface">{item.name}</p>
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        {item.quantity} x {formatIDR(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-sans text-xs font-bold text-on-surface">
                        {formatIDR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Breakdown */}
            <div className="mt-stack-md space-y-2.5 border-t border-outline-variant/40 pt-4 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-bold text-on-surface">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping ({selectedCourierObj.name.split(" ")[0]})</span>
                <span className="font-bold text-on-surface">
                  {shippingCost === 0 ? "FREE" : formatIDR(shippingCost)}
                </span>
              </div>
            </div>

            <div className="mt-stack-md flex items-center justify-between border-t border-outline-variant/40 pt-4">
              <span className="font-display text-body-lg font-bold text-on-surface">Total</span>
              <span className="font-sans text-headline-sm text-price-green">{formatIDR(grandTotal)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-stack-md flex h-12 w-full items-center justify-center gap-2 rounded bg-primary text-label-md text-on-primary transition-all hover:bg-primary-container disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Place Order ({formatIDR(grandTotal)})
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-on-surface-variant">
              <ShieldCheck size={14} className="text-primary" />
              <span>100% Safe & Live Arrival Guarantee</span>
            </div>
          </div>

          <Link href="/cart" className="flex items-center justify-center gap-1.5 text-sm font-bold text-primary hover:underline">
            <ArrowLeft size={15} />
            Back to Cart
          </Link>
        </aside>
      </form>

      {/* CHECKOUT SUCCESSFUL POPUP MODAL */}
      {showSuccessModal && createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-background-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Success Header Icon */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="mt-4 font-display text-headline-md font-bold text-on-surface">
                Order Placed Successfully! 🎉
              </h2>

              <p className="mt-1 text-sm text-on-surface-variant">
                Thank you for your order. We have registered your purchase.
              </p>

              <div className="mt-3 rounded-full bg-primary/10 px-4 py-1 font-mono text-xs font-bold text-primary">
                Order #{createdOrder.orderNumber}
              </div>
            </div>

            {/* Quick Order Info */}
            <div className="mt-6 divide-y divide-outline-variant/40 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4 text-xs">
              <div className="flex justify-between pb-2 text-on-surface-variant">
                <span>Total Amount</span>
                <span className="font-sans text-sm font-bold text-price-green">
                  {formatIDR(createdOrder.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-on-surface-variant">
                <span>Shipping Courier</span>
                <span className="font-bold text-on-surface">{createdOrder.courier}</span>
              </div>
            </div>

            {/* Items Preview */}
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Purchased Items ({createdOrder.items.length})
              </p>
              <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                {createdOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded bg-surface-container p-2 text-xs">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-background-white">
                      <Image
                        src={
                          !item.productImage || item.productImage.includes("picsum.photos")
                            ? "/images/products/product-placeholder.svg"
                            : item.productImage
                        }
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-bold text-on-surface">{item.productName}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {item.quantity} x {formatIDR(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push(`/checkout/success/${encodeURIComponent(createdOrder.orderNumber)}`);
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary-container"
              >
                <ExternalLink size={16} />
                View Order Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/account");
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded border border-outline-variant/60 bg-background-white text-sm font-bold text-on-surface transition-colors hover:bg-surface-container"
              >
                <Package size={16} className="text-primary" />
                Track Delivery in Account History
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/shop");
                }}
                className="flex h-9 w-full items-center justify-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary"
              >
                <ShoppingBag size={14} />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT FAILED MODAL */}
      {showFailedModal && createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-background-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 ring-8 ring-red-50">
                <XCircle size={36} />
              </div>

              <h2 className="mt-4 font-display text-headline-md font-bold text-on-surface">
                Payment Not Completed
              </h2>

              <p className="mt-2 text-sm text-on-surface-variant">
                {failedMessage}
              </p>

              <div className="mt-3 rounded-full bg-primary/10 px-4 py-1 font-mono text-xs font-bold text-primary">
                Order #{createdOrder.orderNumber}
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleRetryPayment}
                className="flex h-11 w-full items-center justify-center gap-2 rounded bg-emerald-600 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-700"
              >
                <RotateCcw size={16} />
                Try Payment Again
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFailedModal(false);
                  router.push(`/checkout/success/${encodeURIComponent(createdOrder.orderNumber)}`);
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded border border-outline-variant/60 bg-background-white text-sm font-bold text-on-surface transition-colors hover:bg-surface-container"
              >
                <ExternalLink size={16} />
                View Order Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFailedModal(false);
                  router.push("/shop");
                }}
                className="flex h-9 w-full items-center justify-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary"
              >
                <ShoppingBag size={14} />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
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
      <Link href="/cart" className="hover:text-primary">
        Cart
      </Link>
      <span>/</span>
      <span className="font-bold text-primary">Checkout</span>
    </nav>
  );
}
