import { featuredProducts } from "@/data/products";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

export default function FeaturedProducts() {
  return (
    <SectionReveal
      as="section"
      className="bg-surface-container-low py-section-gap-mobile md:py-section-gap"
    >
      <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
        <SectionHeading
          title="Featured Products"
          subtitle="Hand-selected for quality and aesthetic appeal."
          action={{ label: "View All Products", href: "/shop" }}
        />

        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
