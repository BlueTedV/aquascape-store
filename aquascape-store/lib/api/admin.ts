import { ProductBadge } from "@/lib/types";
import { ProductDetail } from "./products";
import { authenticatedRequest, publicRequest } from "./auth";

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
};

export type ProductSpecInput = {
  label: string;
  value: string;
};

export type AdminUploadResult = {
  bucket: string;
  path: string;
  url: string;
};

export type ProductAdminInput = {
  name: string;
  slug?: string;
  categorySlug: string;
  collection: string;
  brand: string;
  price: number;
  compareAtPrice?: number | null;
  rating?: number;
  reviewCount?: number;
  image: string;
  badge?: ProductBadge | null;
  featured: boolean;
  stock: number;
  onSale: boolean;
  unit?: string | null;
  arrival: boolean;
  tags: string[];
  description?: string | null;
  gallery: string[];
  specs: ProductSpecInput[];
};

export async function getAdminProducts() {
  return authenticatedRequest<ProductDetail[]>("/api/admin/products");
}

export async function getAdminCategories() {
  return publicRequest<AdminCategory[]>("/api/categories");
}

export async function createAdminProduct(input: ProductAdminInput) {
  return authenticatedRequest<ProductDetail>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminProduct(id: string, input: ProductAdminInput) {
  return authenticatedRequest<ProductDetail>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
export async function uploadAdminImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return authenticatedRequest<AdminUploadResult>("/api/admin/uploads/images", {
    method: "POST",
    body: formData,
  });
}

export async function deleteAllAdminProducts(passcode: string) {
  return authenticatedRequest<{ message: string }>("/api/admin/products", {
    method: "DELETE",
    body: JSON.stringify({ passcode }),
  });
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  statusCounts: {
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
    cancelled: number;
  };
  lowStockCount: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    slug: string;
    stock: number;
    price: number;
    image: string;
  }>;
  topProducts: Array<{
    name: string;
    totalQty: number;
    totalRevenue: number;
    image: string;
  }>;
}

export async function getAdminAnalytics() {
  return authenticatedRequest<AdminAnalytics>("/api/admin/analytics");
}