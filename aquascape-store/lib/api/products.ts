export interface ApiProduct {
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
  badge?: "New" | "Best Seller" | "Premium";
  featured: boolean;
  stock: number;
  onSale: boolean;
  unit?: string;
  arrival: boolean;
  tags: string[];
}

export interface ProductDetail extends ApiProduct {
  gallery: string[];
  description: string;
  specs: { label: string; value: string }[];
}

export type DbProduct = ApiProduct;

type ApiResponse<T> = {
  data: T;
  message?: string;
};

const API_URL = (process.env.AQUAKU_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const PRODUCT_IMAGE_PLACEHOLDER = "/images/products/product-placeholder.svg";

function normalizeImage(image: string | null | undefined) {
  if (!image || image.includes("picsum.photos") || image.includes("fastly.picsum.photos")) {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }

  return image;
}

function normalizeProduct<T extends ApiProduct>(product: T): T {
  return {
    ...product,
    image: normalizeImage(product.image),
  };
}

function normalizeProductDetail(product: ProductDetail): ProductDetail {
  const normalized = normalizeProduct(product);
  const gallery = product.gallery
    .map((image) => normalizeImage(image))
    .filter((image, index, images) => image && images.indexOf(image) === index);

  return {
    ...normalized,
    gallery: gallery.length > 0 ? gallery : [normalized.image],
  };
}

async function fetchApi<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Aquaku Shop: backend request failed", path, response.status);
      return fallback;
    }

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data ?? fallback;
  } catch (error) {
    console.error("Aquaku Shop: backend unavailable", path, error);
    return fallback;
  }
}

export async function getProducts(): Promise<ApiProduct[]> {
  const products = await fetchApi<ApiProduct[]>("/api/products", []);
  return products.map(normalizeProduct);
}

export async function getFeaturedProducts(limit = 4): Promise<ApiProduct[]> {
  const products = await fetchApi<ApiProduct[]>(`/api/products/featured?limit=${limit}`, []);
  return products.map(normalizeProduct);
}

export async function getProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await fetchApi<ProductDetail | null>(`/api/products/${encodeURIComponent(slug)}`, null);
  return product ? normalizeProductDetail(product) : null;
}

export async function getRelatedProductDetails(
  product: ProductDetail,
  limit = 4,
): Promise<ProductDetail[]> {
  const products = await fetchApi<ProductDetail[]>(
    `/api/products/${encodeURIComponent(product.slug)}/related?limit=${limit}`,
    [],
  );

  return products.map(normalizeProductDetail);
}