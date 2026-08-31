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
      {/* Top Admin Navigation Tabs */}
      <div className="mb-stack-lg flex overflow-x-auto border-b border-outline-variant/60">
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2.5 whitespace-nowrap border-b-2 px-6 py-3.5 text-sm font-bold transition-all ${
            activeTab === "analytics"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <BarChart3 size={18} />
          Sales &amp; Analytics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2.5 whitespace-nowrap border-b-2 px-6 py-3.5 text-sm font-bold transition-all ${
            activeTab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Package size={18} />
          Products Catalog
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2.5 whitespace-nowrap border-b-2 px-6 py-3.5 text-sm font-bold transition-all ${
            activeTab === "orders"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <ShoppingBag size={18} />
          Customer Orders
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("articles")}
          className={`flex items-center gap-2.5 whitespace-nowrap border-b-2 px-6 py-3.5 text-sm font-bold transition-all ${
            activeTab === "articles"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <BookOpen size={18} />
          Help Articles
        </button>
      </div>

      {activeTab === "analytics" && <AnalyticsOverview />}
      {activeTab === "products" && <ManageProductsView />}
      {activeTab === "orders" && <ManageOrdersView />}
      {activeTab === "articles" && <ManageArticlesView />}
    </div>
  );
}
