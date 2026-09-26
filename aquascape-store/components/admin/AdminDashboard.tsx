"use client";

import { useState } from "react";
import { BarChart3, Package, ShoppingBag, BookOpen } from "lucide-react";
import ManageProductsView from "./ManageProductsView";
import ManageOrdersView from "./ManageOrdersView";
import AnalyticsOverview from "./AnalyticsOverview";
import ManageArticlesView from "./ManageArticlesView";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "articles">("analytics");

  return (
    <div className="mx-auto max-w-container">
      {/* Admin Mobile/Desktop Header */}
      <div className="mb-4 sm:mb-stack-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-outline-variant/40 pb-3 sm:pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">
            <span>🛡️</span> Aquaku Admin Console
          </span>
          <h1 className="mt-1 font-display text-xl sm:text-headline-lg font-bold text-on-surface">
            Store Management Center
          </h1>
        </div>
      </div>

      {/* Top Admin Navigation Tabs (Touch-friendly Pill Rail) */}
      <div className="mb-5 sm:mb-stack-lg flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-outline-variant/40 pb-2.5 sm:pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "analytics"
              ? "bg-primary text-on-primary shadow-xs"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <BarChart3 size={16} />
          <span>Sales &amp; Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "products"
              ? "bg-primary text-on-primary shadow-xs"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <Package size={16} />
          <span>Products</span>
          <span className="hidden sm:inline">Catalog</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "orders"
              ? "bg-primary text-on-primary shadow-xs"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <ShoppingBag size={16} />
          <span>Customer Orders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("articles")}
          className={`flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "articles"
              ? "bg-primary text-on-primary shadow-xs"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <BookOpen size={16} />
          <span>Help Articles</span>
        </button>
      </div>

      {activeTab === "analytics" && <AnalyticsOverview />}
      {activeTab === "products" && <ManageProductsView />}
      {activeTab === "orders" && <ManageOrdersView />}
      {activeTab === "articles" && <ManageArticlesView />}
    </div>
  );
}
