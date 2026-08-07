import { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-plants",
    slug: "plants",
    name: "Aquatic Plants",
    href: "/shop?category=plants",
    image: "https://picsum.photos/seed/aqua-plants-cat/600/600",
  },
  {
    id: "cat-hardscape",
    slug: "hardscape",
    name: "Hardscape",
    href: "/shop?category=hardscape",
    image: "https://picsum.photos/seed/aqua-hardscape-cat/600/600",
  },
  {
    id: "cat-fish",
    slug: "fish",
    name: "Fish",
    href: "/shop?category=fish",
    image: "https://picsum.photos/seed/aqua-fish-cat/600/600",
  },
  {
    id: "cat-shrimp",
    slug: "shrimp",
    name: "Shrimp",
    href: "/shop?category=shrimp",
    image: "https://picsum.photos/seed/aqua-shrimp-cat/600/600",
  },
  {
    id: "cat-equipment",
    slug: "equipment",
    name: "Equipment",
    href: "/shop?category=equipment",
    icon: "Filter",
  },
  {
    id: "cat-substrate",
    slug: "substrate",
    name: "Substrate",
    href: "/shop?category=others",
    icon: "Layers",
  },
];
