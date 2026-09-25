"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface MobileSwipeGalleryProps {
  gallery: string[];
  productName: string;
  badge?: string;
  isOutOfStock: boolean;
  isLowStock: boolean;
  onSale?: boolean;
  arrival?: boolean;
  stock: number;
}

export default function MobileSwipeGallery({
  gallery,
  productName,
  badge,
  isOutOfStock,
  isLowStock,
  onSale,
  arrival,
  stock,
}: MobileSwipeGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const images = gallery.length > 0 ? gallery : ["/images/products/product-placeholder.svg"];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveImageIndex(Math.min(Math.max(index, 0), images.length - 1));
  };

  const scrollToImage = (index: number) => {
    setActiveImageIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const badgeText = isOutOfStock
    ? "Out of Stock"
    : isLowStock
    ? `Only ${stock} Left`
    : onSale
    ? "On Sale"
    : arrival
    ? "New Arrival"
    : badge;

  return (
    <div className="min-w-0">
      {/* MOBILE VIEW (< md): Touch Swipeable Carousel */}
      <div className="md:hidden">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-background-white shadow-soft">
          {/* Scroll Track */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
          >
            {images.map((img, idx) => (
              <div key={idx} className="relative h-full w-full shrink-0 snap-center">
                <Image
                  src={img}
                  alt={`${productName} view ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Badges */}
          {badgeText && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-xs ${
                isOutOfStock
                  ? "bg-red-600"
                  : isLowStock
                  ? "bg-amber-500"
                  : "bg-primary-fixed text-on-primary-fixed"
              }`}
            >
              {badgeText}
            </span>
          )}

          {/* Slide Counter Pill */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] font-bold text-white backdrop-blur-xs shadow-xs">
              {activeImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Dots Navigation on Mobile */}
        {images.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToImage(idx)}
                aria-label={`Go to image ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeImageIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-outline-variant"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP VIEW (>= md): Classic Main Image + 4-Thumbnail Grid */}
      <div className="hidden md:block">
        <div className="relative aspect-[1.08/1] max-h-[430px] overflow-hidden rounded-xl bg-background-white shadow-soft">
          <Image
            src={images[activeImageIndex] || images[0]}
            alt={productName}
            fill
            priority
            sizes="(min-width: 1024px) 520px, 50vw"
            className="object-cover"
          />
          {badgeText && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-xs ${
                isOutOfStock
                  ? "bg-red-600"
                  : isLowStock
                  ? "bg-amber-500"
                  : "bg-primary-fixed text-on-primary-fixed"
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {images.map((image, index) => {
              const selected = index === activeImageIndex;

              return (
                <button
                  key={image + index}
                  type="button"
                  aria-label={`Show product image ${index + 1}`}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg border bg-background-white transition-all ${
                    selected
                      ? "border-primary ring-2 ring-primary/20 scale-[0.98]"
                      : "border-outline-variant hover:border-primary"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${productName} view ${index + 1}`}
                    fill
                    sizes="110px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
