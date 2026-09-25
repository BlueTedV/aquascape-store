"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { aquascapeStyles } from "@/data/styles";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

function getStyleTag(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export default function StyleGrid() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.firstElementChild?.clientWidth || 280;
    const scrollAmount = direction === "left" ? -(cardWidth + 12) : cardWidth + 12;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollToIdx = (idx: number) => {
    if (!sliderRef.current) return;
    const card = sliderRef.current.children[idx] as HTMLElement;
    if (card) {
      sliderRef.current.scrollTo({
        left: card.offsetLeft - 16,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.firstElementChild?.clientWidth || 280;
    const index = Math.round(scrollLeft / (cardWidth + 12));
    setActiveIndex(Math.min(Math.max(index, 0), aquascapeStyles.length - 1));
  };

  return (
    <SectionReveal
      as="section"
      className="mx-auto max-w-container px-edge-margin-mobile py-section-gap-mobile md:px-edge-margin-desktop md:py-section-gap"
    >
      <div className="flex items-end justify-between mb-4 sm:mb-6">
        <SectionHeading title="Shop by Aquascape Style" />

        {/* Mobile / Tablet slider arrow buttons */}
        <div className="flex items-center gap-1.5 pb-2 lg:hidden">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous style"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container active:scale-95 transition-all shadow-xs"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next style"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container active:scale-95 transition-all shadow-xs"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Slider Container on Mobile / Grid on Desktop */}
      <div className="relative">
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 -mx-edge-margin-mobile px-edge-margin-mobile md:mx-0 md:px-0 lg:grid lg:grid-cols-4 lg:gap-gutter lg:overflow-visible"
        >
          {aquascapeStyles.map((style) => (
            <Link
              key={style.id}
              href={`/shop?tag=${getStyleTag(style.slug)}`}
              className="group relative block w-[78vw] max-w-[320px] sm:w-[320px] shrink-0 snap-center lg:w-auto lg:shrink h-72 sm:h-80 lg:h-96 overflow-hidden rounded-2xl shadow-soft transition-all duration-300 hover:shadow-soft-hover"
            >
              <Image
                src={style.image}
                alt={`${style.name} aquascape style example`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                <h3 className="mb-1 font-display text-headline-sm sm:text-headline-md text-white font-bold">
                  {style.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/80 line-clamp-2 mb-2 leading-relaxed">
                  {style.description}
                </p>
                <span className="flex items-center gap-1.5 font-sans text-xs sm:text-label-md font-bold text-primary-fixed">
                  Explore Style
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Pagination Dot Indicator */}
        <div className="flex justify-center items-center gap-1.5 mt-3 lg:hidden">
          {aquascapeStyles.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-outline-variant"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
