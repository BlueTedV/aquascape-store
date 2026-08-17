export type ProductBadge = "New" | "Best Seller" | "Premium";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number; // in IDR
  rating: number; // 0-5
  reviewCount: number;
  image: string;
  badge?: ProductBadge;
  featured?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  href: string;
  image?: string;
  /** lucide-react icon name, used for categories without dedicated photography */
  icon?: string;
}

export interface AquascapeStyle {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
}

export interface GalleryPost {
  id: string;
  title: string;
  authorName: string;
  description?: string;
  tankSpecs?: string;
  image: string;
  alt?: string;
  size?: "tall" | "square" | "wide";
  likesCount: number;
  isLiked?: boolean;
  createdAt?: string;
}

export type GalleryItem = GalleryPost;


export interface BuildStep {
  id: string;
  step: number;
  title: string;
  icon: string;
}

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number; // in IDR, per unit
  image: string;
  category?: string;
  unit?: string;
  quantity: number;
}
