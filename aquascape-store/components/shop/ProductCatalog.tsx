"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  Star,
  Calculator,
  Heart,
} from "lucide-react";
import { ProductBadge } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { useAuthCart } from "@/lib/use-auth-cart";
import { useWishlist } from "@/lib/wishlist-context";
import { DbProduct } from "@/lib/api/products";
import { getHeroSlides, HeroSlideItem } from "@/lib/api/hero-slides";
import MobileFilterDrawer from "@/components/shop/MobileFilterDrawer";

type CategorySlug =
  | "all"
  | "plants"
  | "hardscape"
  | "fish"
  | "shrimp"
  | "equipment"
  | "others";
type SortOption = "popular" | "newest" | "price-asc" | "price-desc" | "rating";
type StatusFilter = "available" | "sale" | "new";

type HeroSlideDisplay = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  filter?: StatusFilter | string;
  category?: CategorySlug;
  image: string;
};

type CatalogProduct = DbProduct;

interface ProductCatalogProps {
  products: CatalogProduct[];
  total?: number;
  currentPage?: number;
  totalPages?: number;
  catalogBrands?: string[];
  maxCatalogPrice?: number;
  initialCategory?: string;
  initialCollection?: string;
  initialBadge?: ProductBadge;
  initialTag?: string;
  initialQuery?: string;
  initialSort?: SortOption;
  initialStatuses?: StatusFilter[];
  initialBrands?: string[];
  initialMaxPrice?: number;
}

const categoryTabs: { label: string; value: CategorySlug }[] = [
  { label: "All", value: "all" },
  { label: "Plants", value: "plants" },
  { label: "Hardscape", value: "hardscape" },
  { label: "Fish", value: "fish" },
  { label: "Shrimp", value: "shrimp" },
  { label: "Equipment", value: "equipment" },
  { label: "Others", value: "others" },
];

const collectionsByCategory: Record<CategorySlug, string[]> = {
  all: ["Dragon Stone", "Seiryu Stone", "Spider Wood", "Tissue Culture", "Stem Plants", "Lighting", "Filtration", "CO2 System", "Neocaridina", "Tetra", "Substrates", "Tools"],
  plants: ["Stem Plants", "Carpeting Plants", "Moss", "Tissue Culture"],
  hardscape: ["Dragon Stone", "Seiryu Stone", "Spider Wood", "Driftwood"],
  fish: ["Tetra", "Rasbora", "Corydoras", "Algae Eaters"],
  shrimp: ["Neocaridina", "Caridina", "Breeding Packs", "Food & Minerals"],
  equipment: ["Lighting", "Filtration", "CO2 System", "Tanks"],
  others: ["Substrates", "Fertilizers", "Water Care", "Tools"],
};

const defaultHeroSlides: HeroSlideDisplay[] = [
  {
    eyebrow: "Weekend sale",
    title: "Hardscape bundles up to 25% off",
    body: "Curated stone and wood packs for nano tanks through 90P layouts.",
    cta: "Shop Sale Items",
    filter: "sale",
    image: "/images/hero/hero-hardscape.jpg",
  },
  {
    eyebrow: "Fresh arrival",
    title: "New tissue culture plants landed",
    body: "Clean, pest-free cups for carpeting, moss walls, and high-light stems.",
    cta: "See New Items",
    filter: "new",
    image: "/images/hero/hero-plants.jpg",
  },
  {
    eyebrow: "Promo kit",
    title: "CO2 and lighting starter combos",
    body: "Balanced gear sets selected for reliable plant growth and clean displays.",
    cta: "Explore Equipment",
    category: "equipment",
    image: "/images/hero/hero-equipment.jpg",
  },
];

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "Available", value: "available" },
  { label: "On Sale", value: "sale" },
  { label: "New Arrival", value: "new" },
];

function normalizeTag(tag: string) {
  return tag.replace(/^#/, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function getInitialQuery(tag: string | undefined) {
  if (!tag) return "";
  return `#${tag.replace(/^#/, "")}`;
}

function getQueryParts(query: string) {
  const tagMatches = query.match(/#[\w-]+/g) ?? [];
  const tagQueries = tagMatches.map(normalizeTag).filter(Boolean);
  const textQuery = query.replace(/#[\w-]+/g, " ").trim().toLowerCase();

  return { tagQueries, textQuery };
}

function getSafeCategory(value: string | undefined): CategorySlug {
  return categoryTabs.some((category) => category.value === value)
    ? (value as CategorySlug)
    : "all";
}

function ShopPromoCarousel({
  onCategorySelect,
  onStatusSelect,
}: {
  onCategorySelect: (category: CategorySlug) => void;
  onStatusSelect: (status: StatusFilter) => void;
}) {
  const [slides, setSlides] = useState<HeroSlideDisplay[]>(defaultHeroSlides);
  const [active, setActive] = useState(0);

  useEffect(() => {
    getHeroSlides().then((fetched: HeroSlideItem[]) => {
      if (fetched.length > 0) {
        setSlides(
          fetched.map((s: HeroSlideItem) => ({
            eyebrow: s.eyebrow,
            title: s.title,
            body: s.body,
            cta: s.cta,
            filter: s.filter,
            image: s.image,
          })),
        );
      }
    });
  }, []);

  const slide = slides[active] || slides[0] || defaultHeroSlides[0];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const move = (direction: -1 | 1) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  const applySlide = () => {
    if (slide.category) {
      onCategorySelect(slide.category);
    }
    if (slide.filter) {
      onStatusSelect(slide.filter as StatusFilter);
    }
  };

  return (
    <section className="relative h-[380px] overflow-hidden bg-inverse-surface sm:h-[420px] lg:h-[460px]">
      <div className="absolute inset-0">
        <Image
          key={slide.image}
          src={slide.image}
          alt="Aquascaping promotion"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
      </div>

      <div className="relative mx-auto flex h-full max-w-container items-end px-edge-margin-mobile pb-stack-lg pt-28 md:px-edge-margin-desktop">
        <div className="max-w-2xl text-white">
          <p className="font-sans text-label-md uppercase tracking-wider text-primary-fixed">
            {slide.eyebrow}
          </p>
          <h1 className="mt-3 line-clamp-2 font-display text-display-lg-mobile md:text-display-lg">
            {slide.title}
          </h1>
          <p className="mt-stack-md line-clamp-2 max-w-xl text-body-md text-white/85 md:text-body-lg">
            {slide.body}
          </p>
          <button
            type="button"
            onClick={applySlide}
            className="mt-stack-lg rounded bg-primary px-7 py-3 text-label-md text-on-primary shadow-lg transition-colors hover:bg-primary-container"
          >
            {slide.cta}
          </button>
        </div>

        <div className="absolute bottom-stack-lg right-edge-margin-mobile flex items-center gap-2 md:right-edge-margin-desktop">
          <button
            type="button"
            aria-label="Previous promotion"
            onClick={() => move(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-primary transition-colors hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next promotion"
            onClick={() => move(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-primary transition-colors hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="absolute bottom-4 left-edge-margin-mobile flex gap-2 md:left-edge-margin-desktop">
          {slides.map((item, index) => (
            <button
              key={item.title + index}
              type="button"
              aria-label={`Show ${item.eyebrow}`}
              onClick={() => setActive(index)}
              className={`h-2.5 rounded-full transition-all ${
                active === index ? "w-8 bg-primary-fixed" : "w-2.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
function ProductTile({ product }: { product: CatalogProduct }) {
  const { addItem } = useAuthCart();
  const { toggleItem, isFavorited } = useWishlist();
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 3;
  const favorited = isFavorited(product.id);

  const badge = isOutOfStock
    ? "Out of Stock"
    : isLowStock
      ? `Only ${product.stock} Left`
      : product.onSale
        ? "Sale"
        : product.arrival
          ? "New Arrival"
          : product.badge;

  const handleToggleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleItem(product);
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (isOutOfStock) return;

    const wasAdded = await addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      unit: product.unit,
      stock: product.stock,
    });

    if (!wasAdded) return;

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-lg bg-background-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover ${isOutOfStock ? "opacity-85" : ""}`}>
      {/* Wishlist Button */}
      <button
        type="button"
        aria-label={favorited ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        onClick={handleToggleWishlist}
        className={`absolute right-2 top-2 sm:right-3 sm:top-3 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition-all duration-200 hover:scale-110 ${
          favorited ? "text-rose-500" : "text-on-surface-variant hover:text-rose-500 opacity-90 sm:opacity-80 sm:group-hover:opacity-100"
        }`}
      >
        <Heart size={14} className={`sm:h-4 sm:w-4 ${favorited ? "fill-rose-500 text-rose-500" : ""}`} />
      </button>

      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square sm:aspect-[4/3] overflow-hidden bg-surface-container"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 260px, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span
            className={`absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase text-white shadow-xs ${
              isOutOfStock
                ? "bg-red-600"
                : isLowStock
                  ? "bg-amber-500"
                  : "bg-primary-fixed text-on-primary-fixed"
            }`}
          >
            {badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="mb-1.5 flex items-center justify-between gap-1 text-[10px] sm:text-[11px] uppercase text-on-surface-variant">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate">{product.category}</span>
            <span className={`hidden xs:inline-block px-1.5 py-0.5 rounded-sm font-medium tracking-wide ${isOutOfStock ? 'bg-red-50 text-red-600' : 'bg-surface-container-highest text-on-surface'}`}>
              {isOutOfStock ? 'Out' : `${product.stock}`}
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-0.5 text-price-green font-bold">
            <Star size={11} className="fill-price-green sm:h-3 sm:w-3" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-8 sm:min-h-12 font-display text-xs sm:text-body-md font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="hidden sm:flex mt-3 min-h-[58px] content-start flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-container-low px-2 py-1 text-[11px] font-bold text-on-surface-variant"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex min-h-[36px] sm:min-h-[52px] items-end justify-between gap-2 sm:gap-3 pt-2 sm:pt-3">
          <div className="min-w-0">
            <div className="font-sans text-xs sm:text-body-md font-bold text-price-green truncate">
              {formatIDR(product.price)}
              {product.unit && (
                <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant">
                  /{product.unit}
                </span>
              )}
            </div>
            {product.compareAtPrice && (
              <div className="text-[10px] sm:text-xs text-on-surface-variant line-through truncate">
                {formatIDR(product.compareAtPrice)}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            onClick={handleAddToCart}
            className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-colors active:scale-90 ${
              isOutOfStock
                ? "bg-surface-container text-on-surface-variant/40 cursor-not-allowed"
                : "bg-primary text-on-primary hover:bg-primary-container"
            }`}
          >
            {added ? <Check size={14} className="sm:h-[18px] sm:w-[18px]" /> : <ShoppingBasket size={14} className="sm:h-[18px] sm:w-[18px]" />}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductCatalog({
  products,
  total = products.length,
  currentPage = 1,
  totalPages = 1,
  catalogBrands,
  maxCatalogPrice: propMaxPrice,
  initialCategory = "all",
  initialCollection = "all",
  initialBadge,
  initialTag,
  initialQuery,
  initialSort = "popular",
  initialStatuses = [],
  initialBrands = [],
  initialMaxPrice,
}: ProductCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const fallbackMaxPrice = useMemo(
    () => Math.max(1000000, ...products.map((product) => product.price)),
    [products],
  );
  const maxCatalogPrice = propMaxPrice || fallbackMaxPrice;

  const fallbackBrands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort(),
    [products],
  );
  const brands =
    catalogBrands && catalogBrands.length > 0
      ? catalogBrands
      : fallbackBrands;

  const [category, setCategory] = useState<CategorySlug>(
    getSafeCategory(initialCategory),
  );
  const [collection, setCollection] = useState(initialCollection ?? "all");
  const [query, setQuery] = useState(initialQuery ?? getInitialQuery(initialTag));
  const [sort, setSort] = useState<SortOption>(initialSort ?? "popular");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice ?? maxCatalogPrice);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands ?? []);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilter[]>(
    initialStatuses && initialStatuses.length > 0
      ? initialStatuses
      : initialBadge === "New"
        ? ["new"]
        : [],
  );

  const collections = collectionsByCategory[category] || [];

  const updateFilters = (changes: Record<string, string | number | null | undefined>) => {
    const current = new URLSearchParams(searchParams?.toString() ?? "");
    Object.entries(changes).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "" || val === "all") {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });
    // Reset to page 1 unless page itself was changed
    if (!("page" in changes)) {
      current.delete("page");
    }
    const qs = current.toString();
    startTransition(() => {
      router.push(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  useEffect(() => {
    setCategory(getSafeCategory(initialCategory));
  }, [initialCategory]);

  useEffect(() => {
    setCollection(initialCollection ?? "all");
  }, [initialCollection]);

  useEffect(() => {
    setSelectedBrands(initialBrands ?? []);
  }, [initialBrands]);

  useEffect(() => {
    setSelectedStatuses(initialStatuses ?? []);
  }, [initialStatuses]);

  useEffect(() => {
    if (initialSort) setSort(initialSort);
  }, [initialSort]);

  useEffect(() => {
    if (initialMaxPrice !== undefined) {
      setMaxPrice(initialMaxPrice);
    }
  }, [initialMaxPrice]);

  const setCategoryAndReset = (nextCategory: CategorySlug) => {
    setCategory(nextCategory);
    setCollection("all");
    updateFilters({ category: nextCategory === "all" ? null : nextCategory, collection: null });
  };

  const setCollectionAndFilter = (nextCollection: string) => {
    setCollection(nextCollection);
    updateFilters({ collection: nextCollection === "all" ? null : nextCollection });
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((item) => item !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(next);
    updateFilters({ brands: next.length > 0 ? next.join(",") : null });
  };

  const toggleStatus = (status: StatusFilter) => {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter((item) => item !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(next);
    updateFilters({ statuses: next.length > 0 ? next.join(",") : null });
  };

  const handlePriceCommit = (newVal: number) => {
    updateFilters({ maxPrice: newVal >= maxCatalogPrice ? null : newVal });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    updateFilters({ sort: newSort });
  };

  const resetFilters = () => {
    setCategory("all");
    setCollection("all");
    setQuery("");
    setSort("popular");
    setMaxPrice(maxCatalogPrice);
    setSelectedBrands([]);
    setSelectedStatuses([]);
    router.push("/shop");
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams?.get("q") ?? "";
      if (query !== currentQ) {
        updateFilters({ q: query.trim() || null });
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);

  const activeCollectionCount = collection === "all" ? 0 : 1;
  const activeFilterCount =
    activeCollectionCount +
    selectedBrands.length +
    selectedStatuses.length +
    ((initialMaxPrice && initialMaxPrice < maxCatalogPrice) ? 1 : 0) +
    (query.trim() ? 1 : 0);
  return (
    <>
      <ShopPromoCarousel
        onCategorySelect={setCategoryAndReset}
        onStatusSelect={(status: StatusFilter) => setSelectedStatuses([status])}
      />

      <section className="bg-surface-container-low pb-section-gap-mobile md:pb-section-gap">
        <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
          <div className="sticky top-[60px] z-30 -mx-edge-margin-mobile border-b border-outline-variant/40 bg-background-white/95 px-edge-margin-mobile py-2.5 backdrop-blur md:-mx-edge-margin-desktop md:px-edge-margin-desktop">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3">
              {categoryTabs.map((tab) => {
                const selected = category === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setCategoryAndReset(tab.value)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-colors ${
                      selected
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container-low text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Filter & Sort Bar (Exclusive for mobile, hidden on lg) */}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-outline-variant/20 pt-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  activeFilterCount > 0
                    ? "bg-primary text-on-primary shadow-xs"
                    : "border border-outline-variant/60 bg-surface-container-low text-on-surface"
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-on-surface-variant font-medium">
                  {total} {total === 1 ? "item" : "items"}
                </span>
                <select
                  value={sort}
                  onChange={(event) => handleSortChange(event.target.value as SortOption)}
                  className="rounded-full border border-outline-variant/60 bg-surface-container-low px-2.5 py-1 text-xs font-bold text-on-surface outline-none"
                >
                  <option value="popular">Popularity</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low</option>
                  <option value="price-desc">Price: High</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-gutter pt-stack-lg lg:grid-cols-[240px_1fr]">
            {/* Desktop-only filter sidebar, hidden on mobile */}
            <aside className="hidden lg:block lg:sticky lg:top-32 rounded-lg bg-background-white p-stack-md shadow-soft">
              <div className="mb-stack-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-display text-body-lg font-bold text-on-surface">
                  <SlidersHorizontal size={18} className="text-primary" />
                  Filters
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-stack-lg">

                <div>
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Collections
                  </span>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setCollectionAndFilter("all")}
                      className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors ${
                        collection === "all"
                          ? "bg-primary-fixed text-on-primary-fixed"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                      }`}
                    >
                      All collections
                    </button>
                    {collections.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCollectionAndFilter(item)}
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors ${
                          collection === item
                            ? "bg-primary-fixed text-on-primary-fixed"
                            : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Price Range
                  </span>
                  <input
                    type="range"
                    min={10000}
                    max={maxCatalogPrice}
                    step={25000}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    onPointerUp={(event) => handlePriceCommit(Number(event.currentTarget.value))}
                    onTouchEnd={(event) => handlePriceCommit(Number(event.currentTarget.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs font-bold text-on-surface">
                    <span>Rp 0</span>
                    <span>{formatIDR(maxPrice)}</span>
                  </div>
                </label>

                <div>
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Options
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => {
                      const selected = selectedStatuses.includes(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleStatus(option.value)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                            selected
                              ? "border-primary bg-primary text-on-primary"
                              : "border-outline-variant bg-background-white text-on-surface hover:border-primary hover:text-primary"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Brand
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => {
                      const selected = selectedBrands.includes(brand);

                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => toggleBrand(brand)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                            selected
                              ? "border-primary bg-primary text-on-primary"
                              : "border-outline-variant bg-background-white text-on-surface hover:border-primary hover:text-primary"
                          }`}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Tools Helper Card */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Calculator size={15} />
                    <span>Aquascape Calculator</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Calculate exact soil volume, filter turnover flow, and CO2 requirements for your layout.
                  </p>
                  <Link
                    href="/calculator"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Open Calculator &rarr;
                  </Link>
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-stack-md space-y-stack-md">
                <label className="flex w-full items-center gap-3 rounded-lg bg-background-white px-4 py-3 shadow-soft ring-1 ring-outline-variant/40 focus-within:ring-primary">
                  <Search size={18} className="shrink-0 text-primary" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search products or tags like #DutchStyle"
                    className="w-full bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/70"
                  />
                </label>
                <div className="flex flex-col gap-stack-md sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-on-surface-variant">
                    Showing {products.length > 0 ? (currentPage - 1) * 12 + 1 : 0}–{Math.min(currentPage * 12, total)} of {total} products
                  </p>
                  <label className="flex w-full items-center justify-between gap-3 rounded bg-background-white px-3 py-2 text-sm font-bold text-on-surface shadow-soft sm:w-auto">
                    Sort by:
                  <select
                    value={sort}
                    onChange={(event) => handleSortChange(event.target.value as SortOption)}
                    className="bg-transparent text-sm font-bold text-on-surface outline-none"
                  >
                    <option value="popular">Popularity</option>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low</option>
                    <option value="price-desc">Price: High</option>
                    <option value="rating">Rating</option>
                  </select>
                </label>
              </div>

              </div>

              {products.length > 0 ? (
                <>
                  <div className={`grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-gutter xl:grid-cols-3 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
                    {products.map((product) => (
                      <ProductTile key={product.id} product={product} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-stack-lg flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/40 pt-6">
                      <p className="text-xs text-on-surface-variant font-medium">
                        Page {currentPage} of {totalPages} ({total} total products)
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={currentPage <= 1}
                          onClick={() => updateFilters({ page: currentPage - 1 })}
                          className="flex items-center gap-1 rounded border border-outline-variant bg-background-white px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={14} /> Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                          .map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => updateFilters({ page: p })}
                              className={`h-8 w-8 rounded text-xs font-bold transition-colors ${
                                p === currentPage
                                  ? "bg-primary text-on-primary shadow-xs"
                                  : "border border-outline-variant bg-background-white text-on-surface hover:bg-surface-container"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        <button
                          type="button"
                          disabled={currentPage >= totalPages}
                          onClick={() => updateFilters({ page: currentPage + 1 })}
                          className="flex items-center gap-1 rounded border border-outline-variant bg-background-white px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg bg-background-white p-stack-lg text-center shadow-soft">
                  <h3 className="font-display text-headline-md text-on-surface">
                    No products match those filters
                  </h3>
                  <p className="mt-2 text-body-md text-on-surface-variant">
                    Try another collection, brand, or status option.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-stack-md rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                  >
                    Reset Catalog
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Slide-Up Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        totalProducts={total}
        collections={collections}
        selectedCollection={collection}
        onSelectCollection={setCollectionAndFilter}
        maxCatalogPrice={maxCatalogPrice}
        maxPrice={maxPrice}
        onPriceChange={(val) => {
          setMaxPrice(val);
          handlePriceCommit(val);
        }}
        brands={brands}
        selectedBrands={selectedBrands}
        onToggleBrand={toggleBrand}
        statusOptions={statusOptions}
        selectedStatuses={selectedStatuses}
        onToggleStatus={toggleStatus}
        activeFilterCount={activeFilterCount}
        onResetFilters={resetFilters}
      />
    </>
  );
}