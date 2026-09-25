export const revalidate = 60; // Cache shop page queries for 60 seconds

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCatalog from "@/components/shop/ProductCatalog";
import { getProducts } from "@/lib/api/products";
import { ProductBadge } from "@/lib/types";

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    collection?: string | string[];
    brand?: string | string[];
    brands?: string | string[];
    status?: string | string[];
    statuses?: string | string[];
    badge?: string | string[];
    tag?: string | string[];
    q?: string | string[];
    sort?: string | string[];
    page?: string | string[];
    maxPrice?: string | string[];
  }>;
};

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getBadge(value: string | undefined): ProductBadge | undefined {
  if (value === "New" || value === "Best Seller" || value === "Premium") {
    return value;
  }

  return undefined;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const initialCategory = getParam(params?.category);
  const initialCollection = getParam(params?.collection);
  const initialBadge = getBadge(getParam(params?.badge));
  const initialTag = getParam(params?.tag);
  const initialQuery = getParam(params?.q) || (initialTag ? `#${initialTag.replace(/^#/, "")}` : undefined);
  const initialSort = (getParam(params?.sort) as any) || "popular";
  const initialPage = Number(getParam(params?.page)) || 1;
  const initialMaxPrice = params?.maxPrice ? Number(getParam(params?.maxPrice)) : undefined;

  const rawBrands = getParam(params?.brands) || getParam(params?.brand);
  const initialBrands = rawBrands ? rawBrands.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const rawStatuses = getParam(params?.statuses) || getParam(params?.status);
  const initialStatuses = rawStatuses
    ? (rawStatuses.split(",").map((s) => s.trim()).filter(Boolean) as any[])
    : initialBadge === "New"
      ? ["new" as const]
      : [];

  const catalogResult = await getProducts({
    category: initialCategory,
    collection: initialCollection,
    brands: initialBrands,
    statuses: initialStatuses,
    q: initialQuery,
    sort: initialSort,
    page: initialPage,
    maxPrice: initialMaxPrice,
    limit: 12,
  });

  return (
    <>
      <Navbar activeCategory={initialCategory} />
      <main className="bg-surface-container-low">
        <ProductCatalog
          products={catalogResult.products}
          total={catalogResult.total}
          currentPage={catalogResult.page}
          totalPages={catalogResult.totalPages}
          catalogBrands={catalogResult.brands}
          maxCatalogPrice={catalogResult.maxPrice}
          initialCategory={initialCategory}
          initialCollection={initialCollection}
          initialBadge={initialBadge}
          initialTag={initialTag}
          initialQuery={initialQuery}
          initialSort={initialSort}
          initialStatuses={initialStatuses}
          initialBrands={initialBrands}
          initialMaxPrice={initialMaxPrice}
        />
      </main>
      <Footer />
    </>
  );
}