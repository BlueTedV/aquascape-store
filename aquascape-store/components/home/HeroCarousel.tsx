"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlideItem } from "@/lib/api/hero-slides";

const STATIC_FALLBACK = {
  id: "fallback",
  eyebrow: "Premium Aquascaping Supplies",
  title: "Create Your Underwater World",
  body: "Premium aquatic plants, hardscape, fish, shrimp, and professional aquascaping equipment for the modern hobbyist.",
  cta: "Shop Now",
  filter: "all",
  image: "/images/home/Hero.jpg",
};

interface HeroCarouselProps {
  slides: HeroSlideItem[];
}

function buildHref(filter: string): string {
  if (!filter || filter === "all") return "/shop";
  return `/shop?category=${encodeURIComponent(filter)}`;
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const items = slides.length > 0 ? slides : [STATIC_FALLBACK];
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + items.length) % items.length);
    },
    [items.length],
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (items.length <= 1 || paused) return;
    timerRef.current = setInterval(goNext, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, items.length, paused]);

  const slide = items[current];

  return (
    <header
      className="relative flex h-screen min-h-[640px] items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Images (cross-fade) */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          aria-hidden={idx !== current}
          className={`absolute inset-0 z-0 transition-opacity duration-700 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            priority={idx === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
        <div className="max-w-2xl text-white">
          {slide.eyebrow && (
            <p className="mb-3 font-sans text-label-md uppercase tracking-widest text-white/70">
              {slide.eyebrow}
            </p>
          )}
          <h1 className="mb-stack-md font-display text-display-lg-mobile md:text-display-lg">
            {slide.title}
          </h1>
          <p className="mb-stack-lg font-sans text-body-md text-white/90 md:text-body-lg">
            {slide.body}
          </p>
          <Link
            href={buildHref(slide.filter)}
            className="inline-block rounded bg-primary px-10 py-4 font-sans text-label-md text-on-primary shadow-lg transition-colors hover:bg-primary-container"
          >
            {slide.cta || "Shop Now"}
          </Link>
        </div>
      </div>

      {/* Prev / Next Arrows (only shown with multiple slides) */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:left-8"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goNext}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:right-8"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => goTo(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </header>
  );
}
