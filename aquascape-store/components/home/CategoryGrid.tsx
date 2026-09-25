import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";
import CategoryGridClient, { CategoryDisplayItem } from "./CategoryGridClient";
import { categories } from "@/data/categories";
import { getProducts, ApiProduct } from "@/lib/api/products";

// Fallback high-resolution aquascaping photos if a category has no live products in DB yet
const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  plants: "/images/home/style-dutch.jpg",
  hardscape: "/images/home/style-iwagumi.jpg",
  fish: "/images/home/Hero.jpg",
  shrimp: "/images/home/style-jungle.jpg",
  equipment: "/images/hero/hero-equipment.jpg",
  substrate: "/images/home/style-nature.jpg",
  others: "/images/home/style-nature.jpg",
};

function getCategoryCandidateImages(categorySlug: string, products: ApiProduct[]): string[] {
  const slug = categorySlug.toLowerCase();

  const matching = products.filter((p) => {
    const pSlug = (p.categorySlug || "").toLowerCase();
    const pCat = (p.category || "").toLowerCase();
    const pCollection = (p.collection || "").toLowerCase();

    if (slug === "substrate" || slug === "others") {
      return (
        pSlug === "substrate" ||
        pSlug === "others" ||
        pCat.includes("substrate") ||
        pCat.includes("soil") ||
        pCollection.includes("substrate") ||
        pCollection.includes("soil")
      );
    }

    return pSlug === slug || pCat === slug || pCat.includes(slug);
  });

  const images = matching
    .map((p) => p.image)
    .filter((img): img is string => Boolean(img) && !img.includes("product-placeholder.svg"));

  return Array.from(new Set(images));
}

export default async function CategoryGrid() {
  const { products } = await getProducts({ limit: 100 });

  const categoriesWithImages: CategoryDisplayItem[] = categories.map((cat) => {
    const slug = cat.slug.toLowerCase();
    const candidates = getCategoryCandidateImages(slug, products);

    // Pick an initial random image from candidate product images
    let initialImage = "";
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      initialImage = candidates[randomIndex];
    } else {
      initialImage =
        FALLBACK_CATEGORY_IMAGES[slug] ||
        FALLBACK_CATEGORY_IMAGES[cat.id.replace("cat-", "")] ||
        "/images/home/style-nature.jpg";
    }

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      href: cat.href,
      icon: cat.icon,
      initialImage,
      candidateImages: candidates.length > 0 ? candidates : [initialImage],
    };
  });

  return (
    <SectionReveal
      as="section"
      className="mx-auto max-w-container px-edge-margin-mobile py-section-gap-mobile md:px-edge-margin-desktop md:py-section-gap"
    >
      <SectionHeading title="Shop by Category" />
      <CategoryGridClient categories={categoriesWithImages} />
    </SectionReveal>
  );
}
