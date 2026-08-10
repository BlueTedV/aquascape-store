export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/product/ProductDetailView";
import { getProductDetailBySlug, getRelatedProductDetails } from "@/lib/api/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Aquaku Shop",
    };
  }

  return {
    title: `${product.name} | Aquaku Shop`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProductDetails(product);

  return (
    <>
      <Navbar activeCategory={product.categorySlug} />
      <main className="bg-surface-container-low">
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </>
  );
}