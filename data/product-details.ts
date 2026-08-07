import { ProductBadge } from "@/lib/types";

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  collection: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  badge?: ProductBadge;
  featured?: boolean;
  stock: number;
  unit?: string;
  onSale?: boolean;
  arrival?: boolean;
  tags: string[];
  description: string;
  specs: { label: string; value: string }[];
};

type Seed = Omit<ProductDetail, "gallery" | "description" | "specs"> & {
  description?: string;
};

const specsByCategory: Record<string, { label: string; value: string }[]> = {
  hardscape: [
    { label: "Material", value: "Natural aquascape stone / wood" },
    { label: "Color Profile", value: "Earth tones with natural variation" },
    { label: "Texture", value: "Detailed, layout-friendly surface" },
    { label: "Water Impact", value: "Rinse before use; monitor hardness by type" },
    { label: "Recommended Use", value: "Iwagumi, Nature Aquarium, focal hardscape" },
  ],
  plants: [
    { label: "Growth Rate", value: "Medium to fast" },
    { label: "Lighting", value: "Medium to high" },
    { label: "CO2", value: "Recommended" },
    { label: "Placement", value: "Layout dependent" },
    { label: "Care Level", value: "Beginner to intermediate" },
  ],
  equipment: [
    { label: "Use Case", value: "Planted aquascape support system" },
    { label: "Tank Style", value: "Rimless, planted, and display aquariums" },
    { label: "Installation", value: "Clean setup and maintenance" },
    { label: "Care", value: "Inspect and clean regularly" },
    { label: "Warranty", value: "Store warranty support available" },
  ],
  fish: [
    { label: "Temperament", value: "Peaceful community fish" },
    { label: "Tank Zone", value: "Midwater schooling display" },
    { label: "Recommended Group", value: "Keep in groups" },
    { label: "Acclimation", value: "Drip acclimation recommended" },
    { label: "Care Level", value: "Beginner to intermediate" },
  ],
  shrimp: [
    { label: "Temperament", value: "Peaceful freshwater shrimp" },
    { label: "Tank Setup", value: "Mature planted tank" },
    { label: "Food", value: "Biofilm and shrimp food" },
    { label: "Acclimation", value: "Slow drip acclimation recommended" },
    { label: "Care Level", value: "Beginner friendly with stable water" },
  ],
  others: [
    { label: "Use Case", value: "Aquascape setup and maintenance" },
    { label: "Compatibility", value: "Planted freshwater aquariums" },
    { label: "Storage", value: "Keep dry and sealed" },
    { label: "Recommended For", value: "Layout building and routine care" },
    { label: "Care Level", value: "Beginner friendly" },
  ],
};

const descriptions: Record<string, string> = {
  hardscape: "A layout-ready hardscape piece selected for composition, texture, and long-term underwater stability.",
  plants: "Healthy aquascaping plant stock selected for clean growth, strong color, and reliable adaptation.",
  equipment: "Reliable aquascaping equipment chosen for planted tank performance, clean installation, and daily usability.",
  fish: "Active, display-ready livestock selected for peaceful community aquascapes. Acclimate slowly before adding to the tank.",
  shrimp: "Colorful freshwater shrimp for planted and nano aquariums with stable parameters and gentle filtration.",
  others: "Essential aquascaping support item for setup, maintenance, and long-term plant health.",
};

const seeds: Seed[] = [
  { id: "prod-1", slug: "premium-dragon-stone", name: "Premium Dragon Stone", category: "Hardscape", categorySlug: "hardscape", collection: "Dragon Stone", brand: "Aqua Studio", price: 85000, compareAtPrice: 110000, rating: 4.9, reviewCount: 24, image: "https://picsum.photos/seed/aqua-premium-dragon-stone/900/720", badge: "New", featured: true, stock: 24, unit: "kg", onSale: true, arrival: true, tags: ["Iwagumi", "NatureAquarium", "NanoTank"], description: "Also known as Ohko Stone, Dragon Stone is prized for its rugged, dragon-scaled texture and warm brown tones. Each piece is selected for layout depth, strong character, and natural aquascape flow." },
  { id: "prod-2", slug: "spider-wood-medium", name: "Spider Wood Medium", category: "Hardscape", categorySlug: "hardscape", collection: "Spider Wood", brand: "ADA", price: 125000, rating: 4.7, reviewCount: 15, image: "https://picsum.photos/seed/aqua-spider-wood-medium/900/720", featured: true, stock: 15, tags: ["NatureAquarium", "JungleStyle", "Woodscape"] },
  { id: "prod-3", slug: "hc-cuba-tissue-culture", name: "HC Cuba Tissue Culture", category: "Plants", categorySlug: "plants", collection: "Tissue Culture", brand: "Twinstar", price: 45000, rating: 5, reviewCount: 18, image: "https://picsum.photos/seed/aqua-hc-cuba-cup/900/720", badge: "Best Seller", stock: 36, unit: "cup", tags: ["DutchStyle", "Iwagumi", "CarpetPlants"] },
  { id: "prod-4", slug: "studio-pro-led-60cm", name: "Studio Pro LED 60cm", category: "Equipment", categorySlug: "equipment", collection: "Lighting", brand: "Aqua Studio", price: 1450000, compareAtPrice: 1650000, rating: 4.8, reviewCount: 31, image: "https://picsum.photos/seed/aqua-studio-pro-led-60cm/900/720", badge: "Premium", featured: true, stock: 8, onSale: true, tags: ["DutchStyle", "NatureAquarium", "HighTech"] },
  { id: "prod-6", slug: "red-cherry-shrimp-grade-a", name: "Red Cherry Shrimp Grade A", category: "Shrimp", categorySlug: "shrimp", collection: "Neocaridina", brand: "Aqua Studio", price: 12000, rating: 4.8, reviewCount: 42, image: "https://picsum.photos/seed/aqua-red-cherry-shrimp/900/720", badge: "New", stock: 60, unit: "pc", arrival: true, tags: ["JungleStyle", "NatureAquarium", "NanoTank"] },
  { id: "prod-9", slug: "cardinal-tetra-school-10", name: "Cardinal Tetra School 10", category: "Fish", categorySlug: "fish", collection: "Tetra", brand: "Aqua Studio", price: 250000, compareAtPrice: 290000, rating: 4.9, reviewCount: 51, image: "https://picsum.photos/seed/aqua-cardinal-tetra-school/900/720", stock: 12, onSale: true, tags: ["NatureAquarium", "CommunityTank", "SchoolingFish"] },
  { id: "prod-10", slug: "amazonia-aquasoil-9l", name: "Amazonia Aquasoil 9L", category: "Substrate", categorySlug: "others", collection: "Substrates", brand: "ADA", price: 680000, rating: 5, reviewCount: 156, image: "https://picsum.photos/seed/aqua-amazonia-soil-9l/900/720", badge: "Best Seller", featured: true, stock: 21, tags: ["Iwagumi", "DutchStyle", "PlantedTank"] },
];

function titleFromSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inferCategory(slug: string) {
  if (/stone|wood|drift|hardscape/.test(slug)) return { category: "Hardscape", categorySlug: "hardscape", collection: "Layout Materials" };
  if (/plant|rotala|cuba|moss|stem/.test(slug)) return { category: "Plants", categorySlug: "plants", collection: "Aquatic Plants" };
  if (/shrimp|caridina|neocaridina/.test(slug)) return { category: "Shrimp", categorySlug: "shrimp", collection: "Freshwater Shrimp" };
  if (/tetra|fish|rasbora|corydoras/.test(slug)) return { category: "Fish", categorySlug: "fish", collection: "Community Fish" };
  if (/light|filter|co2|tank|diffuser|led/.test(slug)) return { category: "Equipment", categorySlug: "equipment", collection: "Aquascape Equipment" };
  return { category: "Aquascape Supplies", categorySlug: "others", collection: "Essentials" };
}

function galleryFor(slug: string, image: string) {
  return [
    image,
    `https://picsum.photos/seed/${slug}-detail-a/900/720`,
    `https://picsum.photos/seed/${slug}-detail-b/900/720`,
    `https://picsum.photos/seed/${slug}-layout/900/720`,
  ];
}

function normalize(product: Seed): ProductDetail {
  const key = product.categorySlug in descriptions ? product.categorySlug : "others";
  return {
    ...product,
    gallery: galleryFor(product.slug, product.image),
    description: product.description ?? descriptions[key],
    specs: specsByCategory[key],
  };
}

function fallbackProduct(slug: string): ProductDetail {
  const inferred = inferCategory(slug);
  const key = inferred.categorySlug in descriptions ? inferred.categorySlug : "others";
  const image = `https://picsum.photos/seed/aqua-${slug}/900/720`;

  return {
    id: `mock-${slug}`,
    slug,
    name: titleFromSlug(slug),
    ...inferred,
    brand: "Aqua Studio",
    price: 125000,
    rating: 4.7,
    reviewCount: 18,
    image,
    gallery: galleryFor(slug, image),
    stock: 12,
    tags: ["NatureAquarium", "Aquascape", "PlantedTank"],
    description: descriptions[key],
    specs: specsByCategory[key],
  };
}

export const productDetails = seeds.map(normalize);

export function getProductBySlug(slug: string) {
  return productDetails.find((product) => product.slug === slug) ?? fallbackProduct(slug);
}

export function getRelatedProducts(product: ProductDetail, limit = 4) {
  const sameCategory = productDetails.filter(
    (item) => item.slug !== product.slug && item.categorySlug === product.categorySlug,
  );
  const fallback = productDetails.filter(
    (item) => item.slug !== product.slug && item.categorySlug !== product.categorySlug,
  );

  return [...sameCategory, ...fallback].slice(0, limit);
}
