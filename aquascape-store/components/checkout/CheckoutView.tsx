"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Package,
  ShoppingBag,
  ExternalLink,
  XCircle,
  RotateCcw,
  Tag,
  Ticket,
  X,
  Lock,
  MapPin,
  Truck,
  CreditCard,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatIDR } from "@/lib/format";
import { getCurrentAccount } from "@/lib/api/auth";
import { createCheckoutOrder, validateVoucher, Order, VoucherResult } from "@/lib/api/orders";
import MidtransSnapScript from "@/components/checkout/MidtransSnapScript";

const COURIERS = [
  { id: "standard", name: "Standard Delivery (JNE / SiCepat)", eta: "2-3 Days", price: 15000 },
  { id: "express", name: "Express Air Delivery (J&T Super)", eta: "1 Day", price: 30000 },
  { id: "same_day", name: "Instant / Same Day Courier (GoSend)", eta: "Same Day", price: 45000 },
];

const PAYMENT_METHODS = [
  {
    id: "midtrans",
    name: "Midtrans Snap (All Payment Channels)",
    description: "QRIS, Virtual Accounts (BCA, BNI, BRI, Mandiri, Permata), GoPay, ShopeePay, Cards",
    badge: "Recommended",
  },
  {
    id: "bank_transfer",
    name: "Virtual Account (Bank Transfer)",
    description: "Instant Virtual Accounts for BCA, BNI, BRI, CIMB, Permata",
  },
  {
    id: "qris",
    name: "QRIS & E-Wallets",
    description: "Instant QR code scan for GoPay, ShopeePay, OVO, Dana, & mobile banking",
  },
  {
    id: "credit_card",
    name: "Credit / Debit Card",
    description: "Visa, MasterCard, JCB with 3D-Secure authentication",
  },
];

const FREE_SHIPPING_THRESHOLD = 300000;

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
    paymentMethod: "midtrans",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedMessage, setFailedMessage] = useState<string>("");

  // Voucher / Promo Code State
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResult | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Delivery App Mobile Layout States
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  // Auto-fill logged in user account info
  useEffect(() => {
    getCurrentAccount()
      .then((account) => {
        if (!account) {
          setIsAddressExpanded(true);
          return;
        }
        const hasAddress = Boolean(account.shippingAddress?.addressLine1);
        setIsAddressExpanded(!hasAddress);
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
        setIsAddressExpanded(true);
      });
  }, []);

  // Selected courier price & totals
  const selectedCourierObj = COURIERS.find((c) => c.id === formData.courier) || COURIERS[0];
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD && formData.courier === "standard" ? 0 : selectedCourierObj.price;
  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const grandTotal = Math.max(0, subtotal + shippingCost - discountAmount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openSnapPayment = (
    order: Order
  ): Promise<{ status: "success" | "pending" | "error" | "cancelled"; message?: string }> => {
    return new Promise((resolve) => {
      const snapToken = order.midtransSnapToken;

      if (!snapToken) {
        resolve({
          status: "error",
          message: `Missing Midtrans Snap Token from server response for Order #${order.orderNumber}. Verify MIDTRANS_SERVER_KEY in aquaku-api/.env.`,
        });
        return;
      }

      if (typeof window === "undefined" || !window.snap) {
        resolve({
          status: "error",
          message:
            "Midtrans Snap SDK (snap.js) is not loaded in your browser. Verify NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is configured in aquascape-store/.env.local.",
        });
        return;
      }

      try {
        window.snap.pay(snapToken, {
          onSuccess: (result: SnapResult) => {
            console.log("Midtrans Payment Success Callback:", result);
            const status = (result?.transaction_status || "").toLowerCase();
            const statusCode = result?.status_code;

            // Check if user or Midtrans returned a cancellation / failure status
            if (
              status === "cancel" ||
              status === "deny" ||
              status === "expire" ||
              status === "failure" ||
              statusCode === "202" ||
              (statusCode && parseInt(statusCode, 10) >= 400)
            ) {
              resolve({
                status: "cancelled",
                message: result?.status_message || "Payment was cancelled in Midtrans.",
              });
              return;
            }

            if (status === "pending" || statusCode === "201") {
              resolve({
                status: "pending",
                message: "Payment instruction generated. Awaiting bank/e-wallet transfer.",
              });
              return;
            }

            resolve({ status: "success" });
          },
          onPending: (result: SnapResult) => {
            console.log("Midtrans Payment Pending Callback:", result);
            const status = (result?.transaction_status || "").toLowerCase();
            if (status === "cancel" || status === "deny" || status === "expire") {
              resolve({
                status: "cancelled",
                message: "Payment was cancelled in Midtrans.",
              });
              return;
            }

            resolve({
              status: "pending",
              message: "Payment instruction generated. Please complete transfer before expiration.",
            });
          },
          onError: (result: SnapResult) => {
            console.error("Midtrans Payment Error Callback:", result);
            const msg =
              result?.status_message ||
              (typeof result === "string" ? result : "Payment could not be processed or was cancelled.");
            resolve({ status: "error", message: msg });
          },
          onClose: () => {
            console.log("Midtrans Payment Popup Closed by User");
            resolve({
              status: "cancelled",
              message: "You closed the payment popup before completing the transaction.",
            });
          },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        resolve({ status: "error", message: `Snap.pay execution exception: ${msg}` });
      }
    });
  };

  const handleRetryPayment = async () => {
    if (!createdOrder) return;
    setShowFailedModal(false);

    if (!createdOrder.midtransSnapToken) {
      setErrorMessage("No Snap Token available for this order to retry payment.");
      return;
    }

    const result = await openSnapPayment(createdOrder);
    if (result.status === "error") {
      setFailedMessage(
        result.message || "The payment was cancelled or could not be completed. You can try again."
      );
      setShowFailedModal(true);
    } else {
      clearCart();
      router.push(`/checkout/success/${encodeURIComponent(createdOrder.orderNumber)}`);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setValidatingVoucher(true);
    setVoucherError(null);

    try {
      const res = await validateVoucher(voucherCodeInput, subtotal, shippingCost);
      setAppliedVoucher(res);
      setVoucherError(null);
    } catch (err: unknown) {
      setVoucherError(err instanceof Error ? err.message : "Invalid voucher code.");
      setAppliedVoucher(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput("");
    setVoucherError(null);
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

    if (
      !formData.customerName.trim() ||
      !formData.customerEmail.trim() ||
      !formData.customerPhone.trim() ||
      !formData.shippingAddress.trim() ||
      !formData.shippingCity.trim() ||
      !formData.shippingPostalCode.trim()
    ) {
      setIsAddressExpanded(true);
      setErrorMessage("Please complete all required shipping and contact details.");
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
        discountAmount,
        voucherCode: appliedVoucher?.code,
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

      setCreatedOrder(order);

      // NO SILENT FALLBACK: If token is missing, raise error immediately!
      if (!order.midtransSnapToken) {
        throw new Error(
          `Order #${order.orderNumber} was created, but the server failed to generate a Midtrans Snap Token. Check MIDTRANS_SERVER_KEY in aquaku-api/.env and server logs.`
        );
      }

      setIsLoading(false);
      const result = await openSnapPayment(order);

      if (result.status === "error") {
        setFailedMessage(
          result.message || "The payment was cancelled or could not be completed. You can try again."
        );
        setShowFailedModal(true);
      } else {
        // Order successfully created in database; clear cart and route to order details
        clearCart();
        router.push(`/checkout/success/${encodeURIComponent(order.orderNumber)}`);
      }
    } catch (err: unknown) {
      console.error("Checkout process error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while placing your order. Please check console."
      );
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
    <div className="mx-auto max-w-container px-3 pb-28 pt-3 sm:px-edge-margin-desktop sm:pt-24 md:pb-20">
      <MidtransSnapScript />

      {/* Compact Mobile Header with Back Button */}
      <div className="mb-2.5 flex items-center justify-between gap-3 sm:mb-6">
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/60 bg-background-white text-on-surface shadow-xs transition-all hover:bg-surface-container-low hover:text-primary active:scale-95 sm:hidden"
            aria-label="Back to Cart"
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
          </Link>
          <div>
            <h1 className="font-display text-base sm:text-headline-lg font-bold text-on-surface">
              Checkout
            </h1>
            <p className="text-[10px] sm:text-body-md text-on-surface-variant line-clamp-1">
              {formData.shippingCity ? `Delivery to ${formData.shippingCity}` : "Complete delivery details"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
          {items.reduce((acc, item) => acc + item.quantity, 0)} {items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="hidden sm:block">
        <Breadcrumb />
      </div>

      {!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY && (
        <div className="mb-3 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-2.5 sm:p-4 text-amber-900 shadow-sm">
          <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Midtrans Client Key Missing</p>
            <p className="mt-0.5 text-[11px]">
              <code>NEXT_PUBLIC_MIDTRANS_CLIENT_KEY</code> is not defined in <code>aquascape-store/.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-3 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-2.5 sm:p-4 text-red-900 shadow-sm">
          <XCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Checkout Error</p>
            <p className="mt-0.5 font-mono text-[11px] break-all">{errorMessage}</p>
          </div>
        </div>
      )}

      <form id="checkout-form" onSubmit={handleSubmit} className="grid gap-2.5 sm:gap-gutter lg:grid-cols-[1fr_420px]">
        {/* Left Column: Delivery Form Sections */}
        <div className="space-y-2 sm:space-y-stack-md">
          {/* Section 1: Delivery Address & Contact (Compact Delivery App Card) */}
          <div className="rounded-xl border border-outline-variant/60 bg-background-white p-2.5 sm:p-3.5 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5 sm:mt-0">
                  <MapPin size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Delivery Address
                    </span>
                    {formData.customerName && (
                      <span className="truncate text-xs font-bold text-on-surface">
                        • {formData.customerName}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-on-surface">
                    {formData.shippingAddress
                      ? `${formData.shippingAddress}, ${formData.shippingCity}`
                      : "No address entered yet"}
                  </p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {formData.customerPhone || formData.customerEmail || "Tap Change to enter address details"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressExpanded((v) => !v)}
                className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                {isAddressExpanded ? "Done" : "Change"}
              </button>
            </div>

            {/* Address & Contact Input Fields */}
            <div className={`mt-2.5 pt-2.5 border-t border-outline-variant/30 space-y-2.5 ${isAddressExpanded ? "block" : "hidden sm:block"}`}>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="Budi Santoso"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="mt-0.5 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-2.5 py-1.5 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    placeholder="budi@example.com"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="mt-0.5 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-2.5 py-1.5 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    placeholder="081234567890"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="mt-0.5 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-2.5 py-1.5 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Street Address *
                </label>
                <textarea
                  name="shippingAddress"
                  required
                  rows={2}
                  placeholder="Street name, building number, apartment/suite number"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="mt-0.5 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-2.5 py-1.5 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    City / District *
                  </label>
                  <input
                    type="text"
                    name="shippingCity"
                    required
                    placeholder="Jakarta Selatan"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    className="mt-0.5 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-2.5 py-1.5 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="shippingPostalCode"
                    required
                    placeholder="12190"
                    value={formData.shippingPostalCode}
                    onChange={handleChange}
                    className="mt-0.5 w-full rounded-lg border border-outline-variant/60 bg-surface-container-low px-2.5 py-1.5 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Courier Option (Compact 3-Column Pill Selector) */}
          <div className="rounded-xl border border-outline-variant/60 bg-background-white p-2.5 sm:p-3.5 shadow-soft">
            <div className="mb-1.5 sm:mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Truck size={15} className="text-primary" />
                <span className="text-xs font-bold text-on-surface">Courier Option</span>
              </div>
              <span className="text-[11px] font-bold text-price-green font-mono">
                {shippingCost === 0 ? "✓ Free Delivery" : formatIDR(shippingCost)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {COURIERS.map((courier) => {
                const isFree = subtotal >= FREE_SHIPPING_THRESHOLD && courier.id === "standard";
                const isSelected = formData.courier === courier.id;

                return (
                  <label
                    key={courier.id}
                    className={`flex cursor-pointer flex-col justify-between rounded-lg sm:rounded-xl border p-1.5 sm:p-2.5 transition-all text-center ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                        : "border-outline-variant/50 bg-surface-container-low/60 hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="courier"
                      value={courier.id}
                      checked={isSelected}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div>
                      <p className="line-clamp-1 text-[11px] sm:text-xs font-bold text-on-surface">
                        {courier.name.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        {courier.eta}
                      </p>
                    </div>
                    <p className="mt-1 font-mono text-[11px] sm:text-xs font-bold text-primary">
                      {isFree ? "FREE" : formatIDR(courier.price)}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Payment Method (Delivery App Style: 1-line selected card with toggle, full grid on desktop) */}
          <div className="rounded-xl border border-outline-variant/60 bg-background-white p-2.5 sm:p-3.5 shadow-soft">
            {/* Mobile View: 1-line Compact Selector with Change toggle */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CreditCard size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {PAYMENT_METHODS.find((m) => m.id === formData.paymentMethod)?.name.split(" (")[0] || "Payment"}
                      </span>
                      {formData.paymentMethod === "midtrans" && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {formData.paymentMethod === "midtrans"
                        ? "QRIS, VA (BCA/Mandiri/BRI), E-Wallet, Cards"
                        : PAYMENT_METHODS.find((m) => m.id === formData.paymentMethod)?.description.split(",")[0]}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentExpanded((v) => !v)}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  {isPaymentExpanded ? "Done" : "Change"}
                </button>
              </div>

              {isPaymentExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-outline-variant/30 space-y-1.5 animate-in fade-in duration-150">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = formData.paymentMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        onClick={() => setIsPaymentExpanded(false)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-outline-variant/50 bg-surface-container-low/60 hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-on-surface">{method.name}</p>
                            {method.badge && (
                              <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                                Best
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-on-surface-variant truncate">{method.description}</p>
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary bg-primary text-white" : "border-outline-variant"}`}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop View: Full 2x2 Grid */}
            <div className="hidden sm:block">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  <span className="text-xs font-bold text-on-surface">Payment Method</span>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  <ShieldCheck size={12} /> Midtrans Snap
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = formData.paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-outline-variant/50 bg-surface-container-low/60 hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-bold text-on-surface">{method.name}</p>
                          {method.badge && (
                            <span className="shrink-0 rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                              Best
                            </span>
                          )}
                        </div>
                        <p className="line-clamp-1 text-[10px] text-on-surface-variant">
                          {method.description.split(",")[0]}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Promo Voucher & Delivery Notes (Dual Compact Row) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Promo Code Card */}
            <div className="rounded-xl border border-outline-variant/60 bg-background-white p-2 sm:p-3 shadow-soft">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-on-surface">
                  <Ticket size={13} className="text-primary shrink-0" />
                  <span>Promo</span>
                </div>
                {appliedVoucher && (
                  <button type="button" onClick={handleRemoveVoucher} className="p-0.5 text-error hover:opacity-80">
                    <X size={12} />
                  </button>
                )}
              </div>

              {appliedVoucher ? (
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded truncate">
                    {appliedVoucher.code}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-700">
                    -{formatIDR(discountAmount)}
                  </span>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Code"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    className="w-full rounded border border-outline-variant/60 bg-surface-container-low px-1.5 py-1 text-[10px] font-mono uppercase text-on-surface focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={validatingVoucher || !voucherCodeInput.trim()}
                    className="shrink-0 rounded bg-primary px-2 py-1 text-[10px] font-bold text-on-primary hover:bg-primary-container disabled:opacity-40"
                  >
                    {validatingVoucher ? <Loader2 size={10} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {voucherError && <p className="mt-0.5 text-[9px] font-bold text-red-600 truncate">{voucherError}</p>}
            </div>

            {/* Delivery Note Card */}
            <div className="rounded-xl border border-outline-variant/60 bg-background-white p-2 sm:p-3 shadow-soft">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-on-surface">
                <FileText size={13} className="text-primary shrink-0" />
                <span>Note</span>
              </div>
              <input
                type="text"
                name="notes"
                placeholder="e.g. Leave with guard"
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 w-full rounded border border-outline-variant/60 bg-surface-container-low px-1.5 py-1 text-[10px] sm:text-xs text-on-surface focus:border-primary focus:outline-none placeholder:text-[10px]"
              />
            </div>
          </div>

          {/* Section 5: Order Items Collapsible Accordion (Mobile Only) */}
          <div className="rounded-xl border border-outline-variant/60 bg-background-white p-2.5 sm:p-3 shadow-soft lg:hidden">
            <button
              type="button"
              onClick={() => setIsOrderSummaryOpen((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-1.5">
                <Package size={15} className="text-primary" />
                <span className="text-xs font-bold text-on-surface">
                  Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-price-green">
                <span>{formatIDR(subtotal)}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOrderSummaryOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {isOrderSummaryOpen && (
              <div className="mt-2.5 divide-y divide-outline-variant/30 border-t border-outline-variant/30 pt-2 animate-in fade-in duration-200">
                <div className="max-h-48 divide-y divide-outline-variant/20 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 py-1.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-container">
                        <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-bold text-on-surface">{item.name}</p>
                        <p className="font-mono text-[10px] text-on-surface-variant">
                          {item.quantity} × {formatIDR(item.price)}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-on-surface">
                        {formatIDR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 space-y-1 pt-2 text-[11px]">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-on-surface">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Shipping ({selectedCourierObj.name.split(" ")[0]})</span>
                    <span className="font-mono font-bold text-on-surface">
                      {shippingCost === 0 ? "FREE" : formatIDR(shippingCost)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Voucher Discount</span>
                      <span className="font-mono font-bold">-{formatIDR(discountAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Desktop Sticky Order Summary */}
        <aside className="hidden lg:block h-fit space-y-stack-md lg:sticky lg:top-32">
          <div className="rounded-xl bg-background-white p-stack-md shadow-soft border border-outline-variant/50">
            <h2 className="font-display text-body-lg font-bold text-on-surface">Order Summary</h2>

            {/* Desktop Items List */}
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
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container">
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

            {/* Desktop Pricing Breakdown */}
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
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Voucher Discount ({appliedVoucher?.code})</span>
                  <span className="font-bold">-{formatIDR(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="mt-stack-md flex items-center justify-between border-t border-outline-variant/40 pt-4">
              <span className="font-display text-body-lg font-bold text-on-surface">Total</span>
              <span className="font-sans text-headline-sm text-price-green">{formatIDR(grandTotal)}</span>
            </div>

            {/* Desktop Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-stack-md flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-label-md text-on-primary shadow-xs transition-all hover:bg-primary-container disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Pay with Midtrans ({formatIDR(grandTotal)})
                </>
              )}
            </button>

            <div className="mt-4 space-y-1 text-center text-xs text-on-surface-variant">
              <div className="flex items-center justify-center gap-1.5 font-bold text-primary">
                <ShieldCheck size={14} />
                <span>Secure Midtrans Payment Gateway</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Supports QRIS, BCA, Mandiri, BNI, BRI, ShopeePay, GoPay, &amp; Cards
              </p>
            </div>
          </div>

          <Link href="/cart" className="flex items-center justify-center gap-1.5 text-sm font-bold text-primary hover:underline">
            <ArrowLeft size={15} />
            Back to Cart
          </Link>
        </aside>
      </form>

      {/* Mobile-Exclusive Sticky Pay Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/40 bg-background-white/95 px-4 py-2.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Total Payment
            </span>
            <p className="font-mono text-base font-bold text-price-green leading-tight">
              {formatIDR(grandTotal)}
            </p>
            {discountAmount > 0 ? (
              <span className="text-[10px] font-bold text-emerald-600">
                Saved {formatIDR(discountAmount)}
              </span>
            ) : (
              <span className="text-[10px] text-on-surface-variant">
                {selectedCourierObj.name.split(" ")[0]} ({shippingCost === 0 ? "Free" : formatIDR(shippingCost)})
              </span>
            )}
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isLoading}
            className="flex flex-1 max-w-[180px] items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold uppercase tracking-wider text-on-primary shadow-xs transition-all hover:bg-primary-container disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Place Order</span>
              </>
            )}
          </button>
        </div>
      </div>

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
                        sizes="40px"
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
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-background-white p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Close X button */}
            <button
              type="button"
              onClick={() => setShowFailedModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-8 ring-amber-50">
                <AlertCircle size={36} />
              </div>

              <h2 className="mt-4 font-display text-headline-md font-bold text-on-surface">
                Payment Cancelled / Incomplete
              </h2>

              <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                {failedMessage}
              </p>

              <div className="mt-3 rounded-full bg-surface-container px-3.5 py-1 text-xs text-on-surface-variant">
                Order <strong className="font-mono font-bold text-on-surface">#{createdOrder.orderNumber}</strong> has been saved.
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleRetryPayment}
                className="flex h-11 w-full items-center justify-center gap-2 rounded bg-primary text-sm font-bold text-white shadow-md transition-colors hover:bg-primary-container"
              >
                <RotateCcw size={16} />
                Try Payment Again
              </button>

              <button
                type="button"
                onClick={() => setShowFailedModal(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded border border-outline-variant/60 bg-background-white text-sm font-bold text-on-surface transition-colors hover:bg-surface-container"
              >
                <ArrowLeft size={16} />
                Return to Checkout
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
