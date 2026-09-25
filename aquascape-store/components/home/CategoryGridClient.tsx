"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Filter, Layers, type LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Filter,
  Layers,
};

export interface CategoryDisplayItem {
  id: string;
  name: string;
  slug: string;
  href: string;
  icon?: string;
  initialImage: string;
  candidateImages: string[];
}

export default function CategoryGridClient({
  categories,
}: {
  categories: CategoryDisplayItem[];
}) {
  const [activeImages, setActiveImages] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    categories.forEach((cat) => {
      initial[cat.id] = cat.initialImage;
    });
    return initial;
  });

  // Randomize images on client mount so each page visit gets a fresh product image from the category
  useEffect(() => {
    const randomized: Record<string, string> = {};
    categories.forEach((cat) => {
      if (cat.candidateImages && cat.candidateImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * cat.candidateImages.length);
        randomized[cat.id] = cat.candidateImages[randomIndex];
      } else {
        randomized[cat.id] = cat.initialImage;
      }
    });
    setActiveImages(randomized);
  }, [categories]);

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => {
        const Icon = category.icon ? CATEGORY_ICONS[category.icon] : null;
        const currentImage = activeImages[category.id] || category.initialImage;

        return (
          <Link
            key={category.id}
            href={category.href}
            className="group block text-center"
          >
            <div className="mb-2 sm:mb-4 aspect-square overflow-hidden rounded-xl bg-surface-container shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-soft-hover">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={category.name}
                  width={400}
                  height={400}
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-container-high transition-colors group-hover:bg-primary-fixed">
                  {Icon && <Icon size={28} className="text-primary sm:h-9 sm:w-9" />}
                </div>
              )}
            </div>
            <span className="line-clamp-1 font-sans text-xs sm:text-label-md font-bold text-on-surface transition-colors group-hover:text-primary">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
