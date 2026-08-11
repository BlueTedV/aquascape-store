"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, RefreshCw, Truck, CheckCircle2, Clock, XCircle, Search, ChevronRight } from "lucide-react";
import { Order, getAdminOrders, updateOrderStatus } from "@/lib/api/orders";
import { formatIDR } from "@/lib/format";

const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ManageOrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders(selectedStatus);
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const filteredOrders = orders.filter((o) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q)
    );
  });

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdating(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await updateOrderStatus(selectedOrder.id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSelectedOrder(updated);
      setMessage(`Order #${updated.orderNumber} status updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-surface-container text-on-surface";
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-container items-center justify-center text-primary">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container">
      {/* Header & Filter Bar */}
      <div className="mb-stack-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {ORDER_STATUSES.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setSelectedStatus(st.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                selectedStatus === st.value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-background-white text-on-surface-variant hover:bg-surface-container border border-outline-variant/60"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="flex items-center gap-1.5 rounded border border-outline-variant/60 bg-background-white px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-surface-container"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {(message || error) && (
        <div
          className={`mb-stack-md rounded px-4 py-3 text-sm ${
            error ? "bg-error-container text-on-error-container" : "bg-primary-fixed text-on-primary-fixed"
          }`}
        >
          {error ?? message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-lg bg-background-white p-stack-lg text-center shadow-soft">
          <Truck size={36} className="mx-auto text-on-surface-variant" />
          <h3 className="mt-3 font-display text-body-lg font-bold text-on-surface">No Orders Found</h3>
          <p className="mt-1 text-xs text-on-surface-variant">There are currently no customer orders in this view.</p>
        </div>
      ) : (
        <div className="grid gap-gutter lg:grid-cols-[380px_1fr]">
          {/* Order List Sidebar */}
          <aside className="rounded-lg bg-background-white p-stack-md shadow-soft lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <label className="mb-stack-md flex items-center gap-2 rounded border border-outline-variant bg-surface-container-low px-3 py-2 focus-within:border-primary">
              <Search size={16} className="text-primary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order # or customer..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </label>

            <div className="space-y-2">
              {filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full rounded border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary-fixed/40 shadow-sm"
                        : "border-outline-variant/60 bg-background-white hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">#{order.orderNumber}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus.toUpperCase()}
                      </span>
                    </div>

                    <p className="mt-1.5 line-clamp-1 text-xs font-bold text-on-surface">{order.customerName}</p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>{order.items.length} items</span>
                      <span className="font-sans font-bold text-price-green">{formatIDR(order.totalAmount)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Order Details Main View */}
          {selectedOrder && (
            <div className="space-y-stack-md rounded-lg bg-background-white p-stack-lg shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/40 pb-stack-md">
                <div>
                  <p className="font-mono text-xs font-bold text-primary">Order #{selectedOrder.orderNumber}</p>
                  <h2 className="mt-1 font-display text-headline-sm text-on-surface">
                    {selectedOrder.customerName}
                  </h2>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Status Update Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant">Set Status:</span>
                  <select
                    disabled={updating}
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="rounded border border-primary bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary focus:outline-none disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid gap-stack-md sm:grid-cols-2">
                <div className="rounded-lg bg-surface-container-low p-4 text-xs">
                  <h4 className="font-bold uppercase text-on-surface-variant">Customer Contact</h4>
                  <p className="mt-2 font-bold text-on-surface">{selectedOrder.customerName}</p>
                  <p className="text-on-surface-variant">{selectedOrder.customerEmail}</p>
                  <p className="text-on-surface-variant">{selectedOrder.customerPhone}</p>
                </div>

                <div className="rounded-lg bg-surface-container-low p-4 text-xs">
                  <h4 className="font-bold uppercase text-on-surface-variant">Shipping & Courier</h4>
                  <p className="mt-2 font-bold text-on-surface">{selectedOrder.courier}</p>
                  <p className="text-on-surface-variant">{selectedOrder.shippingAddress}</p>
                  <p className="text-on-surface-variant">
                    {selectedOrder.shippingCity}, {selectedOrder.shippingPostalCode}
                  </p>
                </div>
              </div>

              {/* Items List Table */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase text-on-surface-variant">Items ({selectedOrder.items.length})</h4>
                <div className="divide-y divide-outline-variant/40 rounded-lg border border-outline-variant/40">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3.5">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-surface-container">
                        <Image src={item.productImage} alt={item.productName} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-bold text-on-surface">{item.productName}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          {item.quantity} x {formatIDR(item.price)}
                        </p>
                      </div>
                      <span className="font-sans text-xs font-bold text-on-surface">{formatIDR(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-outline-variant/40 pt-4 text-xs space-y-2">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-bold text-on-surface">{formatIDR(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-on-surface">
                    {selectedOrder.shippingCost === 0 ? "FREE" : formatIDR(selectedOrder.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-outline-variant/40 pt-3 text-sm font-bold text-on-surface">
                  <span>Grand Total</span>
                  <span className="font-sans text-price-green">{formatIDR(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
