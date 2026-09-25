"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Sliders,
  Star,
  Truck,
  XCircle,
} from "lucide-react";
import { ProductDetail } from "@/lib/api/products";
import { formatIDR } from "@/lib/format";
import { useAuthCart } from "@/lib/use-auth-cart";
import { useWishlist } from "@/lib/wishlist-context";
import ProductReviewsSection from "./ProductReviewsSection";
import MobileSwipeGallery from "./MobileSwipeGallery";
import MobileStickyBuyBar from "./MobileStickyBuyBar";

const DESCRIPTION_PREVIEW_LENGTH = 330;

type ProductDetailViewProps = {
  product: ProductDetail;
  relatedProducts: ProductDetail[];
};

function RelatedProductCard({ product }: { product: ProductDetail }) {
  const { addItem } = useAuthCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
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
    <article className="group flex h-full flex-col overflow-hidden rounded bg-background-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-hover">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[1.2/1] bg-surface-container">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 190px, (min-width: 640px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-primary-fixed px-2 py-1 text-[9px] font-bold uppercase text-on-primary-fixed">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] font-bold uppercase text-on-surface-variant">
          {product.collection}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 min-h-10 font-display text-sm font-bold leading-snug text-on-surface group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex min-h-10 items-center justify-between gap-2 pt-3">
          <p className="text-sm font-bold text-price-green">{formatIDR(product.price)}</p>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
            className="flex h-7 w-7 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-fixed"
          >
            {added ? <Check size={15} /> : <Plus size={15} />}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [specsOpen, setSpecsOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [rating, setRating] = useState(product.rating);
  const [reviewCount, setReviewCount] = useState(product.reviewCount);
  const { addItem } = useAuthCart();
  const { toggleItem, isFavorited } = useWishlist();
  const favorited = isFavorited(product.id);

  const total = useMemo(() => product.price * quantity, [product.price, quantity]);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 3;
  const isLongDescription = product.description.length > DESCRIPTION_PREVIEW_LENGTH;
  const shownDescription =
    isLongDescription && !descriptionExpanded
      ? `${product.description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}...`
      : product.description;

  const addToCart = async () => {
    const wasAdded = await addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      unit: product.unit,
      quantity,
      stock: product.stock,
    });

    if (!wasAdded) return;

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="mx-auto max-w-[980px] px-4 sm:px-6 pb-28 pt-20 sm:pt-24 md:px-8 md:pb-20">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-primary">
          {product.category}
        </Link>
        <span>/</span>
        <span className="font-bold text-primary">{product.name}</span>
      </nav>

      <section className="grid items-start gap-8 lg:grid-cols-[520px_minmax(0,1fr)]">
        <MobileSwipeGallery
          gallery={product.gallery}
          productName={product.name}
          badge={product.badge}
          isOutOfStock={isOutOfStock}
          isLowStock={isLowStock}
          onSale={product.onSale}
          arrival={product.arrival}
          stock={product.stock}
        />

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-price-green">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={index < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                />
              ))}
              <span className="ml-1 text-on-surface-variant">
                {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
            <button
              type="button"
              aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => toggleItem(product)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 ${
                favorited
                  ? "border-rose-300 bg-rose-50 text-rose-500 shadow-xs"
                  : "border-outline-variant bg-background-white text-on-surface-variant hover:border-rose-400 hover:text-rose-500"
              }`}
              title={favorited ? "Saved in Wishlist" : "Save to Wishlist"}
            >
              <Heart size={18} className={favorited ? "fill-rose-500 text-rose-500" : ""} />
            </button>
          </div>

          <h1 className="mt-2 max-w-[360px] font-display text-4xl font-bold leading-none text-on-surface md:text-[42px]">
            {product.name}
          </h1>
          <p className="mt-3 text-xl font-bold text-price-green">
            {formatIDR(product.price)}
            {product.unit && <span className="ml-1 text-xs font-normal text-on-surface-variant">/ {product.unit}</span>}
          </p>

          <div className="mt-4 text-sm leading-6 text-on-surface-variant">
            <p>{shownDescription}</p>
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((value) => !value)}
                className="mt-2 text-xs font-bold uppercase text-primary transition-colors hover:text-primary-container"
              >
                {descriptionExpanded ? "Show less" : "Click to see more"}
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Link
                key={tag}
                href={`/shop?tag=${tag}`}
                className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-bold text-on-surface-variant transition-colors hover:bg-primary-fixed hover:text-on-primary-fixed"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="mt-5 rounded-md border border-outline-variant/50 bg-background-white p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                {isOutOfStock ? (
                  <>
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-red-600">Out of stock</span>
                  </>
                ) : isLowStock ? (
                  <>
                    <AlertTriangle size={16} className="text-amber-500" />
                    <span className="text-amber-700">Only {product.stock} left in stock - order soon!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-emerald-700">{product.stock} in stock</span>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-on-surface-variant">Total estimate</p>
                <p className="text-sm font-bold text-price-green">{formatIDR(total)}</p>
              </div>
            </div>

            <div className="grid grid-cols-[130px_1fr] gap-3">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">
                  Quantity {product.unit ? `(${product.unit})` : ""}
                </p>
                <div className="flex h-10 items-center justify-between rounded bg-surface-container-low px-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant hover:bg-background-white hover:text-primary"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-on-surface">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant hover:bg-background-white hover:text-primary"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={product.stock === 0}
                onClick={addToCart}
                className="mt-5 flex h-10 items-center justify-center gap-2 rounded bg-primary px-5 text-xs font-bold uppercase text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={16} />
                {added ? "Added" : "Add to Cart"}
              </button>
            </div>

            <p className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
              <Truck size={15} className="text-primary" />
              Ships safely within 24 hours for ready stock items.
            </p>
          </div>

          {/* Specifications Collapsible Accordion */}
          {product.specs && product.specs.length > 0 && (
            <section className="mt-6 overflow-hidden rounded-xl border border-outline-variant/50 bg-background-white shadow-soft">
              <button
                type="button"
                onClick={() => setSpecsOpen((v) => !v)}
                className="flex w-full items-center justify-between p-4 text-left font-display text-base font-bold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-primary" />
                  <span>Specifications &amp; Care</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-on-surface-variant transition-transform duration-200 ${
                    specsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {specsOpen && (
                <dl className="divide-y divide-outline-variant/30 border-t border-outline-variant/30 px-4 py-2 animate-in fade-in duration-200">
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-[120px_1fr] gap-3 py-2.5">
                      <dt className="text-xs font-bold text-on-surface">{spec.label}</dt>
                      <dd className="text-xs leading-5 text-on-surface-variant">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )}

          {/* Shipping & Guarantee Accordion */}
          <section className="mt-3 overflow-hidden rounded-xl border border-outline-variant/50 bg-background-white shadow-soft">
            <button
              type="button"
              onClick={() => setShippingOpen((v) => !v)}
              className="flex w-full items-center justify-between p-4 text-left font-display text-base font-bold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-primary" />
                <span>Packaging &amp; Live Guarantee</span>
              </div>
              <ChevronDown
                size={18}
                className={`text-on-surface-variant transition-transform duration-200 ${
                  shippingOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {shippingOpen && (
              <div className="space-y-2 border-t border-outline-variant/30 px-4 py-3.5 text-xs leading-relaxed text-on-surface-variant animate-in fade-in duration-200">
                <p>
                  📦 <strong>Specialized Thermo-Insulation:</strong> Live aquatic plants and livestock are packed in climate-regulated insulated packaging with oxygen injection.
                </p>
                <p>
                  ⚡ <strong>Fast 24-Hour Dispatch:</strong> Ready stock items are dispatched within 24 hours via reliable express couriers across Indonesia.
                </p>
                <p>
                  🛡️ <strong>Live Arrival Guarantee:</strong> Guaranteed 100% pest-free and healthy arrival. Submit an unboxing video within 24 hours for instant replacement or store credit.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>

      <ProductReviewsSection
        productSlug={product.slug}
        productName={product.name}
        initialRating={rating}
        initialReviewCount={reviewCount}
        onReviewSubmitted={(newAvg, newCount) => {
          setRating(newAvg);
          setReviewCount(newCount);
        }}
      />

      <section className="mt-20">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-on-surface">
            Complete Your {product.category}
          </h2>
          <Link href={`/shop?category=${product.categorySlug}`} className="text-xs font-bold uppercase text-primary hover:underline">
            View all {product.category}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
          {relatedProducts.map((item) => (
            <RelatedProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>

      {/* Mobile-Exclusive Sticky Action Bar & Bottom Sheet */}
      <MobileStickyBuyBar
        product={product}
        onAddToCart={async (qty) => {
          const wasAdded = await addItem({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            unit: product.unit,
            quantity: qty,
            stock: product.stock,
          });
          return wasAdded;
        }}
        favorited={favorited}
        onToggleWishlist={() => toggleItem(product)}
      />
    </div>
  );
}