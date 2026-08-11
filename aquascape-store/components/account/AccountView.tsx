"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  MapPin,
  UserRound,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  RefreshCcw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  Account,
  getCurrentAccount,
  logout,
  updateProfile,
  updateShippingAddress,
} from "@/lib/api/auth";
import { getUserOrders, Order } from "@/lib/api/orders";
import { formatIDR } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

export default function AccountView() {
  const router = useRouter();
  const { addItem } = useCart();
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders");
  const [saving, setSaving] = useState<"profile" | "shipping" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getCurrentAccount()
      .then((data) => {
        if (mounted) setAccount(data);
      })
      .catch(() => {
        router.replace("/login?redirect=/account");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    getUserOrders()
      .then((data) => {
        if (mounted) setOrders(data);
      })
      .catch((err) => {
        console.error("Could not fetch user orders", err);
      })
      .finally(() => {
        if (mounted) setLoadingOrders(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving("profile");
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const nextAccount = await updateProfile({
        fullName: String(formData.get("fullName") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
      });
      setAccount(nextAccount);
      setMessage("Profile saved successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save profile.");
    } finally {
      setSaving(null);
    }
  };

  const saveShipping = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving("shipping");
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const nextAccount = await updateShippingAddress({
        recipientName: String(formData.get("recipientName") ?? "").trim(),
        phone: String(formData.get("shippingPhone") ?? "").trim(),
        addressLine1: String(formData.get("addressLine1") ?? "").trim(),
        addressLine2: String(formData.get("addressLine2") ?? "").trim(),
        city: String(formData.get("city") ?? "").trim(),
        province: String(formData.get("province") ?? "").trim(),
        postalCode: String(formData.get("postalCode") ?? "").trim(),
        country: String(formData.get("country") ?? "Indonesia").trim() || "Indonesia",
      });
      setAccount(nextAccount);
      setMessage("Shipping address saved successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save shipping address.");
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({
        id: item.productId || item.id,
        name: item.productName,
        price: item.price,
        image: item.productImage,
        slug: item.productSlug,
        quantity: item.quantity,
      });
    });
    setReorderSuccess(`Added ${order.items.length} items from #${order.orderNumber} to your cart!`);
    setTimeout(() => setReorderSuccess(null), 4000);
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-container items-center justify-center text-primary">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (!account) return null;

  const profile = account.profile;
  const address = account.shippingAddress;

  const activeDeliveries = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.orderStatus));
  const pastOrders = orders.filter((o) => ["completed", "cancelled"].includes(o.orderStatus));

  return (
    <div className="mx-auto max-w-container">
      {/* Header */}
      <div className="mb-stack-lg flex flex-col gap-stack-md sm:flex-row sm:items-end sm:justify-between border-b border-outline-variant/40 pb-6">
        <div>
          <p className="text-label-md uppercase text-tertiary tracking-wider font-bold">My Account</p>
          <h1 className="mt-1 font-display text-headline-lg text-primary">
            Welcome back, {profile?.fullName || account.user.fullName || "Aquascaping Enthusiast"}
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Signed in as <span className="font-bold text-on-surface">{account.user.email}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded border border-outline-variant/60 bg-background-white px-4 py-2.5 text-label-md text-on-surface transition-colors hover:border-error/40 hover:text-error"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-stack-lg flex gap-3 border-b border-outline-variant/40 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${activeTab === "orders"
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
        >
          <Package size={18} />
          Orders & Delivery History
          {activeDeliveries.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white">
              {activeDeliveries.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${activeTab === "settings"
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
        >
          <UserRound size={18} />
          Profile & Address Settings
        </button>
      </div>

      {reorderSuccess && (
        <div className="mb-stack-md flex items-center justify-between rounded-lg bg-emerald-100 p-4 text-emerald-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{reorderSuccess}</span>
          </div>
          <Link href="/cart" className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
            View Cart
          </Link>
        </div>
      )}

      {(message || error) && (
        <div
          className={`mb-stack-md rounded-lg px-4 py-3 text-sm font-medium ${error ? "bg-error-container text-on-error-container" : "bg-emerald-100 text-emerald-900"
            }`}
        >
          {error ?? message}
        </div>
      )}

      {/* TAB 1: ORDERS & DELIVERY HISTORY */}
      {activeTab === "orders" && (
        <div className="space-y-stack-lg">
          {/* Active Deliveries Section */}
          <section className="rounded-lg bg-background-white p-stack-md sm:p-stack-lg shadow-soft">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-stack-md">
              <div className="flex items-center gap-2.5 font-display text-headline-md text-on-surface">
                <Truck size={22} className="text-primary" />
                <h2>Current Deliveries Progress</h2>
              </div>
              <span className="text-xs font-bold uppercase text-on-surface-variant">
                {activeDeliveries.length} Active
              </span>
            </div>

            {loadingOrders ? (
              <div className="flex h-36 items-center justify-center text-primary">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : activeDeliveries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-outline-variant/60 p-8 text-center">
                <Package size={36} className="mx-auto text-on-surface-variant/40" />
                <p className="mt-3 text-sm font-bold text-on-surface">No active deliveries right now</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  When you make a new order, you can track its live delivery progress here.
                </p>
                <Link
                  href="/shop"
                  className="mt-4 inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-xs font-bold text-on-primary hover:bg-primary-container"
                >
                  <ShoppingBag size={14} />
                  Shop Plants & Hardscape
                </Link>
              </div>
            ) : (
              <div className="space-y-stack-md">
                {activeDeliveries.map((order) => (
                  <ActiveDeliveryCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>

          {/* Past Purchases / Order History */}
          <section className="rounded-lg bg-background-white p-stack-md sm:p-stack-lg shadow-soft">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-stack-md">
              <div className="flex items-center gap-2.5 font-display text-headline-md text-on-surface">
                <Package size={22} className="text-primary" />
                <h2>Purchase & Order History</h2>
              </div>
              <span className="text-xs font-bold uppercase text-on-surface-variant">
                {pastOrders.length} Completed
              </span>
            </div>

            {loadingOrders ? (
              <div className="flex h-36 items-center justify-center text-primary">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : pastOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-on-surface-variant">
                No past order history found.
              </div>
            ) : (
              <div className="space-y-4">
                {pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-outline-variant/60 bg-surface-container-low p-4 transition-all hover:border-primary/40 shadow-xs"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-3">
                      <div>
                        <span className="font-mono text-sm font-bold text-primary">#{order.orderNumber}</span>
                        <span className="ml-3 text-xs text-on-surface-variant">
                          Placed on {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase ${order.orderStatus === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-error-container text-on-error-container"
                            }`}
                        >
                          {order.orderStatus}
                        </span>
                        <span className="font-sans text-sm font-bold text-price-green">
                          {formatIDR(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Items Thumbnails */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded bg-background-white p-1.5 pr-3 text-xs border border-outline-variant/40"
                          >
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-surface-container">
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
                            <div>
                              <p className="line-clamp-1 max-w-[140px] font-bold text-on-surface">{item.productName}</p>
                              <p className="text-[10px] text-on-surface-variant">
                                {item.quantity} x {formatIDR(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="flex items-center gap-1.5 rounded border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                        >
                          <RefreshCcw size={13} />
                          Buy Again
                        </button>

                        <Link
                          href={`/checkout/success/${encodeURIComponent(order.orderNumber)}`}
                          className="flex items-center gap-1 rounded bg-surface-container px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-high"
                        >
                          Details
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: PROFILE & ADDRESS SETTINGS */}
      {activeTab === "settings" && (
        <div className="grid gap-gutter lg:grid-cols-2">
          {/* Profile Form */}
          <section className="rounded-lg bg-background-white p-stack-lg shadow-soft">
            <div className="mb-stack-md flex items-center gap-2 font-display text-headline-md text-on-surface">
              <UserRound size={22} className="text-primary" />
              Contact Profile
            </div>
            <form onSubmit={saveProfile} className="space-y-stack-md">
              <label className="block">
                <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                  Full Name
                </span>
                <input
                  name="fullName"
                  defaultValue={profile?.fullName ?? account.user.fullName ?? ""}
                  className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                  Phone
                </span>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? account.user.phone ?? ""}
                  className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                />
              </label>
              <button
                type="submit"
                disabled={saving === "profile"}
                className="flex items-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving === "profile" && <Loader2 size={16} className="animate-spin" />}
                Save Profile
              </button>
            </form>
          </section>

          {/* Shipping Address Form */}
          <section className="rounded-lg bg-background-white p-stack-lg shadow-soft">
            <div className="mb-stack-md flex items-center gap-2 font-display text-headline-md text-on-surface">
              <MapPin size={22} className="text-primary" />
              Default Shipping Address
            </div>
            <form onSubmit={saveShipping} className="space-y-stack-md">
              <div className="grid gap-stack-md sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Recipient
                  </span>
                  <input
                    required
                    name="recipientName"
                    defaultValue={address?.recipientName ?? profile?.fullName ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Phone
                  </span>
                  <input
                    required
                    name="shippingPhone"
                    type="tel"
                    defaultValue={address?.phone ?? profile?.phone ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                  Address Line 1
                </span>
                <input
                  required
                  name="addressLine1"
                  defaultValue={address?.addressLine1 ?? ""}
                  className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                  Address Line 2
                </span>
                <input
                  name="addressLine2"
                  defaultValue={address?.addressLine2 ?? ""}
                  className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                />
              </label>
              <div className="grid gap-stack-md sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    City
                  </span>
                  <input
                    required
                    name="city"
                    defaultValue={address?.city ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Province
                  </span>
                  <input
                    required
                    name="province"
                    defaultValue={address?.province ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
              </div>
              <div className="grid gap-stack-md sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Postal Code
                  </span>
                  <input
                    required
                    name="postalCode"
                    defaultValue={address?.postalCode ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Country
                  </span>
                  <input
                    required
                    name="country"
                    defaultValue={address?.country ?? "Indonesia"}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={saving === "shipping"}
                className="flex items-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving === "shipping" && <Loader2 size={16} className="animate-spin" />}
                Save Address
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

{/* ACTIVE DELIVERY PROGRESS CARD COMPONENT */ }
function ActiveDeliveryCard({ order }: { order: Order }) {
  // Stepper calculations
  const steps = [
    { key: "pending", title: "Order Placed", desc: "Payment / Order Verified" },
    { key: "processing", title: "Processing", desc: "Live Plant & Stock Care" },
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
    <div className="rounded-lg border border-primary/20 bg-surface-container-low p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-primary">#{order.orderNumber}</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
              {order.paymentStatus.toUpperCase()}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Courier: <strong className="text-on-surface">{order.courier}</strong> • Destination: {order.shippingCity}
          </p>
        </div>

        <div className="text-right">
          <p className="font-sans text-lg font-bold text-price-green">{formatIDR(order.totalAmount)}</p>
          <Link
            href={`/checkout/success/${encodeURIComponent(order.orderNumber)}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            View Instructions & Receipt <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* LIVE DELIVERY TRACKER STEPPER */}
      <div className="my-6 px-2">
        <div className="relative flex items-center justify-between">
          {/* Background Track Line */}
          <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-outline-variant/40" />

          {/* Active Fill Line */}
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
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${isFinished
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

        {/* Mobile Step Title */}
        <div className="mt-3 text-center sm:hidden">
          <p className="text-xs font-bold text-primary">
            Current Status: {steps[currentStepIndex].title} ({steps[currentStepIndex].desc})
          </p>
        </div>
      </div>

      {/* Items Preview */}
      <div className="divide-y divide-outline-variant/40 rounded-lg bg-background-white border border-outline-variant/40 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant pb-2">
          Items in this delivery ({order.items.length})
        </p>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2 text-xs">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-container">
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
            <span className="font-sans font-bold text-on-surface">{formatIDR(item.subtotal)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}