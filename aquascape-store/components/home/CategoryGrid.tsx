import Image from "next/image";
import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/data/categories";
import { getProducts } from "@/lib/api/products";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

function isRealUploadedImage(image: string | null | undefined): boolean {
  if (!image) return false;
  const trimmed = image.trim();
  if (
    trimmed === "" ||
    trimmed.includes("product-placeholder.svg") ||
    trimmed.includes("picsum.photos") ||
    trimmed.includes("fastly.picsum.photos")
  ) {
    return false;
  }
  return true;
}

export default async function CategoryGrid() {
  const products = await getProducts();

  const dynamicCategories = categories.map((category) => {
    const catSlug = category.slug.toLowerCase();
    const catName = category.name.toLowerCase();

    const productWithImage = products.find((p) => {
      const pSlug = (p.categorySlug || "").toLowerCase();
      const pName = (p.category || "").toLowerCase();

      const isCategoryMatch =
        pSlug === catSlug ||
        pName === catName ||
        (catSlug === "substrate" && (pSlug === "others" || pName.includes("substrate")));

      return isCategoryMatch && isRealUploadedImage(p.image);
    });

    return {
      ...category,
      image: productWithImage?.image || category.image,
    };
  });

  return (
    <SectionReveal
      as="section"
      className="mx-auto max-w-container px-edge-margin-mobile py-section-gap-mobile md:px-edge-margin-desktop md:py-section-gap"
    >
      <SectionHeading title="Shop by Category" />

      <div className="grid grid-cols-2 gap-gutter md:grid-cols-3 lg:grid-cols-6">
        {dynamicCategories.map((category) => {
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

