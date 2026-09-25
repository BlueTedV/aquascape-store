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

/**
 * Product Catalog Client API.
 *
 * Provides functions to fetch catalog listings, product details, and category data
 * from the backend, normalizing images and handling connection fallbacks gracefully.
 */

const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? process.env.AQUAKU_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const PRODUCT_IMAGE_PLACEHOLDER = "/images/products/product-placeholder.svg";

/**
 * Sanitizes product image URLs, falling back to a local SVG placeholder if the URL is empty
 * or points to decommissioned external mock services (like picsum).
 */
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

export interface ProductQueryParams {
  category?: string;
  collection?: string;
  brands?: string[];
  statuses?: string[];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProductsResult {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  brands: string[];
  maxPrice: number;
}

async function fetchApi<T>(path: string, fallback: T, options?: { revalidate?: number; tags?: string[] }): Promise<T> {
  try {
    const fetchOptions: RequestInit = {
      headers: {
        Accept: "application/json",
      },
    };

    if (options?.revalidate !== undefined) {
      fetchOptions.next = {
        revalidate: options.revalidate,
        tags: options.tags,
      };
    } else {
      // Default to 60s cache with tag for ISR performance
      fetchOptions.next = { revalidate: 60, tags: ["products"] };
    }

    const response = await fetch(`${API_URL}${path}`, fetchOptions);

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

export async function getProducts(params?: ProductQueryParams): Promise<PaginatedProductsResult> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.collection && params.collection !== "all") query.set("collection", params.collection);
  if (params?.brands && params.brands.length > 0) query.set("brands", params.brands.join(","));
  if (params?.statuses && params.statuses.length > 0) query.set("statuses", params.statuses.join(","));
  if (params?.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params?.q) query.set("q", params.q);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  const path = `/api/products${queryString ? `?${queryString}` : ""}`;

  const fallback: PaginatedProductsResult = {
    products: [],
    total: 0,
    page: 1,
    limit: params?.limit ?? 12,
    totalPages: 1,
    brands: [],
    maxPrice: 1000000,
  };

  const data = await fetchApi<any>(path, fallback);

  if (Array.isArray(data)) {
    return {
      products: data.map(normalizeProduct),
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1,
      brands: [],
      maxPrice: 1000000,
    };
  }

  return {
    products: (data?.products || []).map(normalizeProduct),
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 12,
    totalPages: data?.totalPages ?? 1,
    brands: data?.brands ?? [],
    maxPrice: data?.maxPrice ?? 1000000,
  };
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