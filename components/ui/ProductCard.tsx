import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import StarRating from "./StarRating";
import Badge from "./Badge";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative rounded-lg bg-background-white p-stack-md shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-hover">
      {product.badge && <Badge type={product.badge} />}

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
        <h3 className="mb-1 line-clamp-1 font-display text-body-lg font-bold text-on-surface">
          {product.name}
        </h3>
      </Link>

      <div className="mb-2">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      <p className="font-sans text-price-display text-price-green">
        {formatIDR(product.price)}
      </p>

      <button
        type="button"
        aria-label={`Add ${product.name} to cart`}
        className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
