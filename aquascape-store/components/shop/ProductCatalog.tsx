"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { ProductBadge } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { useAuthCart } from "@/lib/use-auth-cart";
import { DbProduct } from "@/lib/api/products";

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

type CatalogProduct = DbProduct;

interface ProductCatalogProps {
  products: CatalogProduct[];
  initialCategory?: string;
  initialBadge?: ProductBadge;
  initialTag?: string;
  initialQuery?: string;
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

const heroSlides = [
  {
    eyebrow: "Weekend sale",
    title: "Hardscape bundles up to 25% off",
    body: "Curated stone and wood packs for nano tanks through 90P layouts.",
    cta: "Shop Sale Items",
    filter: "sale" as StatusFilter,
    image: "/images/home/promo-sale.svg",
  },
  {
    eyebrow: "Fresh arrival",
    title: "New tissue culture plants landed",
    body: "Clean, pest-free cups for carpeting, moss walls, and high-light stems.",
    cta: "See New Items",
    filter: "new" as StatusFilter,
    image: "/images/home/promo-new.svg",
  },
  {
    eyebrow: "Promo kit",
    title: "CO2 and lighting starter combos",
    body: "Balanced gear sets selected for reliable plant growth and clean displays.",
    cta: "Explore Equipment",
    category: "equipment" as CategorySlug,
    image: "/images/home/promo-equipment.svg",
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

function CatalogHero({
  onCategorySelect,
  onStatusSelect,
}: {
  onCategorySelect: (category: CategorySlug) => void;
  onStatusSelect: (status: StatusFilter) => void;
}) {
  const [active, setActive] = useState(0);
  const slide = heroSlides[active];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: -1 | 1) => {
    setActive((current) =>
      (current + direction + heroSlides.length) % heroSlides.length,
    );
  };

  const applySlide = () => {
    if (slide.category) {
      onCategorySelect(slide.category);
    }
    if (slide.filter) {
      onStatusSelect(slide.filter);
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
          {heroSlides.map((item, index) => (
            <button
              key={item.title}
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
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 3;

  const badge = isOutOfStock
    ? "Out of Stock"
    : isLowStock
      ? `Only ${product.stock} Left`
      : product.onSale
        ? "Sale"
        : product.arrival
          ? "New Arrival"
          : product.badge;

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
    });

    if (!wasAdded) return;

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-lg bg-background-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover ${isOutOfStock ? "opacity-85" : ""}`}>
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-container"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 260px, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-xs ${
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

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-[11px] uppercase text-on-surface-variant">
          <span>{product.category}</span>
          <span className="flex items-center gap-1 text-price-green">
            <Star size={12} className="fill-price-green" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-12 font-display text-body-md font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-3 flex min-h-[58px] content-start flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-container-low px-2 py-1 text-[11px] font-bold text-on-surface-variant"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex min-h-[52px] items-end justify-between gap-3 pt-3">
          <div>
            <div className="font-sans text-body-md font-bold text-price-green">
              {formatIDR(product.price)}
              {product.unit && (
                <span className="text-xs font-normal text-on-surface-variant">
                  / {product.unit}
                </span>
              )}
            </div>
            {product.compareAtPrice && (
              <div className="mt-1 text-xs text-on-surface-variant line-through">
                {formatIDR(product.compareAtPrice)}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            onClick={handleAddToCart}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
              isOutOfStock
                ? "bg-surface-container text-on-surface-variant/40 cursor-not-allowed"
                : "bg-primary text-on-primary hover:bg-primary-container"
            }`}
          >
            {added ? <Check size={18} /> : <ShoppingBasket size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductCatalog({
  products,
  initialCategory = "all",
  initialBadge,
  initialTag,
  initialQuery,
}: ProductCatalogProps) {
  const maxCatalogPrice = useMemo(
    () => Math.max(1, ...products.map((product) => product.price)),
    [products],
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort(),
    [products],
  );

  const [category, setCategory] = useState<CategorySlug>(
    getSafeCategory(initialCategory),
  );
  const [collection, setCollection] = useState("all");
  const [query, setQuery] = useState(initialQuery ?? getInitialQuery(initialTag));
  const [sort, setSort] = useState<SortOption>("popular");
  const [maxPrice, setMaxPrice] = useState(maxCatalogPrice);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilter[]>(
    initialBadge === "New" ? ["new"] : ["available"],
  );
  const [visibleCount, setVisibleCount] = useState(12);


  const collections = collectionsByCategory[category];

  const setCategoryAndReset = (nextCategory: CategorySlug) => {
    setCategory(nextCategory);
    setCollection("all");
    setVisibleCount(12);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand)
        ? current.filter((item) => item !== brand)
        : [...current, brand],
    );
  };

  const toggleStatus = (status: StatusFilter) => {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  };

  const filteredProducts = useMemo(() => {
    const { tagQueries, textQuery } = getQueryParts(query);

    const hasTagQuery = tagQueries.length > 0;

    return products
      .filter((product) => {
        const matchesCategory =
          hasTagQuery || category === "all" || product.categorySlug === category;
        const matchesCollection =
          hasTagQuery || collection === "all" || product.collection === collection;
        const matchesBrand =
          selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const matchesStatus =
          selectedStatuses.length === 0 ||
          selectedStatuses.some((status) => {
            if (status === "available") return product.stock > 0;
            if (status === "sale") return Boolean(product.onSale);
            return Boolean(product.arrival || product.badge === "New");
          });
        const matchesPrice = product.price <= maxPrice;
        const productTags = product.tags.map(normalizeTag);
        const matchesTags =
          tagQueries.length === 0 ||
          tagQueries.every((tag) => productTags.includes(tag));
        const matchesQuery =
          !textQuery ||
          [
            product.name,
            product.category,
            product.collection,
            product.brand,
            product.badge ?? "",
            ...product.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(textQuery);

        return (
          matchesCategory &&
          matchesCollection &&
          matchesBrand &&
          matchesStatus &&
          matchesPrice &&
          matchesTags &&
          matchesQuery
        );
      })
      .sort((a, b) => {
        if (sort === "newest") {
          return Number(Boolean(b.arrival)) - Number(Boolean(a.arrival));
        }
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "rating") {
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        }
        return b.reviewCount - a.reviewCount;
      });
  }, [category, collection, maxPrice, products, query, selectedBrands, selectedStatuses, sort]);

  const shownProducts = filteredProducts.slice(0, visibleCount);
  const activeCollectionCount = collection === "all" ? 0 : 1;
  const activeFilterCount =
    activeCollectionCount +
    selectedBrands.length +
    selectedStatuses.length +
    (maxPrice < maxCatalogPrice ? 1 : 0) +
    (query.trim() ? 1 : 0);

  const resetFilters = () => {
    setCollection("all");
    setQuery("");
    setSort("popular");
    setMaxPrice(maxCatalogPrice);
    setSelectedBrands([]);
    setSelectedStatuses(["available"]);
    setVisibleCount(12);
  };

  const getCollectionCount = (item: string) =>
    products.filter((product) => {
      const categoryMatch = category === "all" || product.categorySlug === category;
      return categoryMatch && product.collection === item;
    }).length;
  return (
    <>
      <CatalogHero
        onCategorySelect={setCategoryAndReset}
        onStatusSelect={(status) => setSelectedStatuses([status])}
      />

      <section className="bg-surface-container-low pb-section-gap-mobile md:pb-section-gap">
        <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
          <div className="sticky top-[60px] z-30 -mx-edge-margin-mobile border-b border-outline-variant/40 bg-background-white/95 px-edge-margin-mobile py-3 backdrop-blur md:-mx-edge-margin-desktop md:px-edge-margin-desktop">
            <div className="no-scrollbar flex items-center gap-3 overflow-x-auto">
              {categoryTabs.map((tab) => {
                const selected = category === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setCategoryAndReset(tab.value)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                      selected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-gutter pt-stack-lg lg:grid-cols-[240px_1fr]">
            <aside className="rounded-lg bg-background-white p-stack-md shadow-soft lg:sticky lg:top-32">
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
                      onClick={() => setCollection("all")}
                      className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors ${
                        collection === "all"
                          ? "bg-primary-fixed text-on-primary-fixed"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                      }`}
                    >
                      All collections
                      <span className="text-xs text-on-surface-variant">
                        {products.filter(
                          (product) =>
                            category === "all" || product.categorySlug === category,
                        ).length}
                      </span>
                    </button>
                    {collections.filter((item) => getCollectionCount(item) > 0).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCollection(item)}
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors ${
                          collection === item
                            ? "bg-primary-fixed text-on-primary-fixed"
                            : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                        }`}
                      >
                        {item}
                        <span className="text-xs text-on-surface-variant">
                          {getCollectionCount(item)}
                        </span>
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
                    Showing {shownProducts.length} of {filteredProducts.length} products
                  </p>
                  <label className="flex w-full items-center justify-between gap-3 rounded bg-background-white px-3 py-2 text-sm font-bold text-on-surface shadow-soft sm:w-auto">
                    Sort by:
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOption)}
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

              {shownProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
                    {shownProducts.map((product) => (
                      <ProductTile key={product.id} product={product} />
                    ))}
                  </div>
                  {shownProducts.length < filteredProducts.length && (
                    <div className="mt-stack-lg flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + 6)}
                        className="rounded border border-outline-variant bg-background-white px-6 py-3 text-label-md text-primary shadow-soft transition-colors hover:bg-primary-fixed"
                      >
                        Load More Products
                      </button>
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
    </>
  );
}