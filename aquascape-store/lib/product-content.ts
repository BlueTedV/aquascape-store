/**
 * The products table stores the facts that vary per product (price, stock,
 * rating, etc). Long-form marketing copy like descriptions and spec sheets
 * doesn't live in the DB yet - it's generated per category here, the same
 * way data/product-details.ts used to do it for the mock catalog.
 */

export const specsByCategory: Record<string, { label: string; value: string }[]> = {
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

export const categoryDescriptions: Record<string, string> = {
  hardscape:
    "A layout-ready hardscape piece selected for composition, texture, and long-term underwater stability.",
  plants:
    "Healthy aquascaping plant stock selected for clean growth, strong color, and reliable adaptation.",
  equipment:
    "Reliable aquascaping equipment chosen for planted tank performance, clean installation, and daily usability.",
  fish:
    "Active, display-ready livestock selected for peaceful community aquascapes. Acclimate slowly before adding to the tank.",
  shrimp:
    "Colorful freshwater shrimp for planted and nano aquariums with stable parameters and gentle filtration.",
  others:
    "Essential aquascaping support item for setup, maintenance, and long-term plant health.",
};

export function getSpecsAndDescription(categorySlug: string) {
  const key = categorySlug in categoryDescriptions ? categorySlug : "others";
  return {
    description: categoryDescriptions[key],
    specs: specsByCategory[key],
  };
}

export function galleryFor(slug: string, image: string): string[] {
  return [
    image,
    `/images/products/product-detail-a.svg`,
    `/images/products/product-detail-b.svg`,
    `/images/products/product-layout.svg`,
  ];
}
