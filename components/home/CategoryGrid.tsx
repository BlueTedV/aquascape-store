import Image from "next/image";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/data/categories";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

export default function CategoryGrid() {
  return (
    <SectionReveal
      as="section"
      className="mx-auto max-w-container px-edge-margin-mobile py-section-gap-mobile md:px-edge-margin-desktop md:py-section-gap"
    >
      <SectionHeading title="Shop by Category" />

      <div className="grid grid-cols-2 gap-gutter md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = category.icon
            ? (Icons[
                category.icon as keyof typeof Icons
              ] as unknown as LucideIcon)
            : null;

          return (
            <Link
              key={category.id}
              href={category.href}
              className="group block text-center"
            >
              <div className="mb-4 aspect-square overflow-hidden rounded-lg shadow-soft">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-container-high transition-colors group-hover:bg-primary-fixed">
                    {Icon && <Icon size={36} className="text-primary" />}
                  </div>
                )}
              </div>
              <span className="font-sans text-label-md text-on-surface transition-colors group-hover:text-primary">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </SectionReveal>
  );
}
