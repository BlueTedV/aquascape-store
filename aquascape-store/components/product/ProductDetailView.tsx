"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Heart, Minus, Plus, ShoppingCart, Star, Truck, XCircle } from "lucide-react";
import { ProductDetail } from "@/lib/api/products";
import { formatIDR } from "@/lib/format";
import { useAuthCart } from "@/lib/use-auth-cart";
import { useWishlist } from "@/lib/wishlist-context";
import ProductReviewsSection from "./ProductReviewsSection";

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
  const [activeImage, setActiveImage] = useState(product.gallery[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
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
    });

    if (!wasAdded) return;

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="mx-auto max-w-[980px] px-5 pb-20 pt-24 md:px-8">
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
        <div className="min-w-0">
          <div className="relative aspect-[1.08/1] max-h-[430px] overflow-hidden rounded-md bg-background-white shadow-soft">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
            {(isOutOfStock || isLowStock || product.onSale || product.arrival || product.badge) && (
              <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-xs ${
                isOutOfStock ? "bg-red-600" : isLowStock ? "bg-amber-500" : "bg-primary-fixed text-on-primary-fixed"
              }`}>
                {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${product.stock} Left` : product.onSale ? "On Sale" : product.arrival ? "New Arrival" : product.badge}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.gallery.map((image, index) => {
              const selected = image === activeImage;

              return (
                <button
                  key={image}
                  type="button"
                  aria-label={`Show product image ${index + 1}`}
                  onClick={() => setActiveImage(image)}
                  className={`relative aspect-square overflow-hidden rounded border bg-background-white transition-colors ${
                    selected ? "border-primary ring-2 ring-primary/20" : "border-outline-variant hover:border-primary"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    sizes="110px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-price-green">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={14} className="fill-price-green" />
              ))}
              <span className="ml-1 text-on-surface-variant">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
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

          <section className="mt-6">
            <h2 className="font-display text-lg font-bold text-on-surface">Specifications</h2>
            <dl className="mt-3 divide-y divide-outline-variant/40 border-y border-outline-variant/40">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-[118px_1fr] gap-3 py-2.5">
                  <dt className="text-xs font-bold text-on-surface">{spec.label}</dt>
                  <dd className="text-xs leading-5 text-on-surface-variant">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </section>

      <ProductReviewsSection
        productSlug={product.slug}
        productName={product.name}
        initialRating={product.rating}
        initialReviewCount={product.reviewCount}
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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {relatedProducts.map((item) => (
            <RelatedProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}