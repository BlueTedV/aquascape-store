"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Heart, Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { useAuthCart } from "@/lib/use-auth-cart";
import { useWishlist } from "@/lib/wishlist-context";
import StarRating from "./StarRating";
import Badge from "./Badge";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useAuthCart();
  const { toggleItem, isFavorited } = useWishlist();
  const [added, setAdded] = useState(false);
  const favorited = isFavorited(product.id);

  const handleToggleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleItem(product);
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const wasAdded = await addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });

    if (!wasAdded) return;

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group relative flex h-full flex-col rounded-lg bg-background-white p-stack-md shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover">
      {product.badge && <Badge type={product.badge} />}

      {/* Wishlist Button */}
      <button
        type="button"
        aria-label={favorited ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        onClick={handleToggleWishlist}
        className={`absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition-all duration-200 hover:scale-110 ${
          favorited ? "text-rose-500" : "text-on-surface-variant hover:text-rose-500 opacity-80 group-hover:opacity-100"
        }`}
      >
        <Heart size={16} className={favorited ? "fill-rose-500 text-rose-500" : ""} />
      </button>

      <Link
        href={`/product/${product.slug}`}
        className="mb-stack-md block aspect-square overflow-hidden rounded-md bg-surface"
      >
        <Image
          src={product.image}
          alt={product.name}
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <Link href={`/product/${product.slug}`}>
        <h3 className="mb-1 line-clamp-2 min-h-14 font-display text-body-lg font-bold leading-snug text-on-surface">
          {product.name}
        </h3>
      </Link>

      <div className="mb-2 min-h-6">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      <p className="mt-auto pr-12 font-sans text-price-display text-price-green">
        {formatIDR(product.price)}
      </p>

      <button
        type="button"
        aria-label={`Add ${product.name} to cart`}
        onClick={handleAddToCart}
        className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100"
      >
        {added ? <Check size={20} /> : <Plus size={20} />}
      </button>
    </div>
  );
}
