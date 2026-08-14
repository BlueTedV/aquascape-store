"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
  XCircle,
} from "lucide-react";
import { AdminAnalytics, getAdminAnalytics } from "@/lib/api/admin";
import { formatIDR } from "@/lib/format";

export default function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminAnalytics();
      setAnalytics(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sales analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-container items-center justify-center text-primary">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-lg bg-background-white p-stack-lg text-center shadow-soft">
        <AlertTriangle size={36} className="mx-auto text-amber-500" />
        <h3 className="mt-3 font-display text-body-lg font-bold text-on-surface">Analytics Unavailable</h3>
        <p className="mt-1 text-xs text-on-surface-variant">{error || "Could not fetch sales metrics."}</p>
        <button
          type="button"
          onClick={fetchAnalytics}
          className="mt-4 rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary-container"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { totalRevenue, totalOrders, averageOrderValue, statusCounts, lowStockCount, lowStockProducts, topProducts } = analytics;

  return (
    <div className="space-y-stack-lg">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-headline-sm text-on-surface">Sales & Revenue Metrics</h2>
          <p className="text-xs text-on-surface-variant">Real-time store performance and inventory health overview.</p>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 rounded border border-outline-variant/60 bg-background-white px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-surface-container"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Metrics
        </button>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Revenue */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="mt-3 font-sans text-2xl font-bold text-emerald-950">{formatIDR(totalRevenue)}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <TrendingUp size={13} /> From completed & paid orders
          </p>
        </div>

        {/* Card 2: Total Orders */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Total Orders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="mt-3 font-sans text-2xl font-bold text-blue-950">{totalOrders} Orders</p>
          <p className="mt-1 text-[11px] font-bold text-blue-700">All customer purchase requests</p>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">Avg Order Value</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white">
              <BarChart3 size={20} />
            </div>
          </div>
          <p className="mt-3 font-sans text-2xl font-bold text-purple-950">{formatIDR(averageOrderValue)}</p>
          <p className="mt-1 text-[11px] font-bold text-purple-700">Average spent per transaction</p>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Low Stock Items</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="mt-3 font-sans text-2xl font-bold text-amber-950">{lowStockCount} Products</p>
          <p className="mt-1 text-[11px] font-bold text-amber-700">Items with stock $\le 3$ remaining</p>
        </div>
      </div>

      {/* Grid: Order Status Distribution & Top Selling Products */}
      <div className="grid gap-gutter lg:grid-cols-2">
        {/* Order Status Breakdown */}
        <div className="rounded-xl bg-background-white p-6 shadow-soft space-y-4">
          <h3 className="font-display text-body-lg font-bold text-on-surface flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Order Status Breakdown
          </h3>

          <div className="space-y-3">
            {[
              { key: "pending", label: "Pending", count: statusCounts.pending, color: "bg-amber-500", icon: Clock },
              { key: "processing", label: "Processing", count: statusCounts.processing, color: "bg-blue-500", icon: Package },
              { key: "shipped", label: "Shipped", count: statusCounts.shipped, color: "bg-purple-500", icon: Truck },
              { key: "completed", label: "Completed", count: statusCounts.completed, color: "bg-emerald-500", icon: CheckCircle2 },
              { key: "cancelled", label: "Cancelled", count: statusCounts.cancelled, color: "bg-red-500", icon: XCircle },
            ].map((st) => {
              const percentage = totalOrders > 0 ? Math.round((st.count / totalOrders) * 100) : 0;
              const IconComp = st.icon;

              return (
                <div key={st.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-on-surface">
                      <IconComp size={15} className="text-on-surface-variant" />
                      {st.label}
                    </span>
                    <span className="font-mono text-on-surface-variant">
                      {st.count} orders ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                    <div className={`h-full ${st.color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-xl bg-background-white p-6 shadow-soft space-y-4">
          <h3 className="font-display text-body-lg font-bold text-on-surface flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Top Selling Products
          </h3>

          {topProducts.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-6">No sales data recorded yet.</p>
          ) : (
            <div className="divide-y divide-outline-variant/40">
              {topProducts.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                      #{index + 1}
                    </span>
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-container">
                      <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-xs font-bold text-on-surface">{item.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{item.totalQty} sold</p>
                    </div>
                  </div>
                  <span className="font-sans text-xs font-bold text-price-green">{formatIDR(item.totalRevenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Warning Table */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-xl bg-background-white p-6 shadow-soft space-y-3 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-display text-body-lg font-bold text-amber-900">
              <AlertTriangle size={18} className="text-amber-600" />
              Low Stock Restock Alerts ({lowStockProducts.length})
            </div>
            <Link href="/manage" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Restock in Products <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts.map((prod) => (
              <div key={prod.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-surface-container">
                  <Image src={prod.image} alt={prod.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-bold text-on-surface">{prod.name}</p>
                  <p className="text-[11px] font-bold text-red-600">Stock: {prod.stock} left</p>
                </div>
                <span className="font-sans text-xs font-bold text-price-green">{formatIDR(prod.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
