export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCatalog from "@/components/shop/ProductCatalog";
import { getProducts } from "@/lib/api/products";
import { ProductBadge } from "@/lib/types";

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    badge?: string | string[];
    tag?: string | string[];
    q?: string | string[];
  }>;
};

function getParam(value: string | string[] | undefined) {
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
  const initialBadge = getBadge(getParam(params?.badge));
  const initialTag = getParam(params?.tag);
  const initialQuery = getParam(params?.q);
  const products = await getProducts();

  return (
    <>
      <Navbar activeCategory={initialCategory} />
      <main className="bg-surface-container-low">
        <ProductCatalog
          key={`${initialCategory ?? "all"}-${initialBadge ?? "all"}-${initialTag ?? "none"}-${initialQuery ?? "none"}`}
          products={products}
          initialCategory={initialCategory}
          initialBadge={initialBadge}
          initialTag={initialTag}
          initialQuery={initialQuery}
        />
      </main>
      <Footer />
    </>
  );
}