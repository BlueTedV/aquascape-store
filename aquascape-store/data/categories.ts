import { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-plants",
    slug: "plants",
    name: "Aquatic Plants",
    href: "/shop?category=plants",
    image: "/images/home/category-plants.svg",
  },
  {
    id: "cat-hardscape",
    slug: "hardscape",
    name: "Hardscape",
    href: "/shop?category=hardscape",
    image: "/images/home/category-hardscape.svg",
  },
  {
    id: "cat-fish",
    slug: "fish",
    name: "Fish",
    href: "/shop?category=fish",
    image: "/images/home/category-fish.svg",
  },
  {
    id: "cat-shrimp",
    slug: "shrimp",
    name: "Shrimp",
    href: "/shop?category=shrimp",
    image: "/images/home/category-shrimp.svg",
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
