"use client";

import Link from "next/link";
import { Calculator, RotateCcw } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import { formatIDR } from "@/lib/format";

type StatusFilter = "available" | "sale" | "new";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalProducts: number;
  collections: string[];
  selectedCollection: string;
  onSelectCollection: (collection: string) => void;
  maxCatalogPrice: number;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  brands: string[];
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  statusOptions: { label: string; value: StatusFilter }[];
  selectedStatuses: StatusFilter[];
  onToggleStatus: (status: StatusFilter) => void;
  activeFilterCount: number;
  onResetFilters: () => void;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  totalProducts,
  collections,
  selectedCollection,
  onSelectCollection,
  maxCatalogPrice,
  maxPrice,
  onPriceChange,
  brands,
  selectedBrands,
  onToggleBrand,
  statusOptions,
  selectedStatuses,
  onToggleStatus,
  activeFilterCount,
  onResetFilters,
}: MobileFilterDrawerProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Products"
      subtitle={`${totalProducts} items available`}
      footer={
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant px-4 py-3 text-xs font-bold text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-primary py-3 text-center text-xs font-bold uppercase tracking-wider text-on-primary shadow-sm hover:bg-primary-container active:scale-98 transition-all"
          >
            Show {totalProducts} Products
          </button>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        {/* Collections */}
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Collections
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSelectCollection("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCollection === "all"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container"
              }`}
            >
              All collections
            </button>
            {collections.map((item) => {
              const isSelected = selectedCollection === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelectCollection(item)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Price Range
          </span>
          <div className="rounded-lg bg-surface-container-low p-3.5">
            <input
              type="range"
              min={10000}
              max={maxCatalogPrice}
              step={25000}
              value={maxPrice}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-2.5 flex items-center justify-between text-xs font-bold text-on-surface">
              <span className="text-on-surface-variant">Rp 0</span>
              <span className="rounded bg-background-white px-2 py-0.5 font-mono text-price-green shadow-xs">
                Up to {formatIDR(maxPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Options / Status */}
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Status
          </span>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const selected = selectedStatuses.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggleStatus(option.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selected
                      ? "border-primary bg-primary text-on-primary shadow-xs"
                      : "border-outline-variant bg-background-white text-on-surface hover:border-primary"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brands */}
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Brand
          </span>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => {
              const selected = selectedBrands.includes(brand);
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onToggleBrand(brand)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                    selected
                      ? "border-primary bg-primary text-on-primary shadow-xs"
                      : "border-outline-variant bg-background-white text-on-surface hover:border-primary"
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Tools Helper Card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Calculator size={15} />
            <span>Aquascape Tank Calculator</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
            Need exact soil volume or filter turnover recommendations?
          </p>
          <Link
            href="/calculator"
            onClick={onClose}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            Launch Calculator &rarr;
          </Link>
        </div>
      </div>
    </BottomSheet>
  );
}
