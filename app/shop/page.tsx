import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCatalog from "@/components/shop/ProductCatalog";
import { ProductBadge } from "@/lib/types";

type ShopPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    badge?: string | string[];
    tag?: string | string[];
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

  return (
    <>
      <Navbar activeCategory={initialCategory} />
      <main className="bg-surface-container-low">
        <ProductCatalog
          key={`${initialCategory ?? "all"}-${initialBadge ?? "all"}-${initialTag ?? "none"}`}
          initialCategory={initialCategory}
          initialBadge={initialBadge}
          initialTag={initialTag}
        />
      </main>
      <Footer />
    </>
  );
}