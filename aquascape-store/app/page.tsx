export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/AboutSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import StyleGrid from "@/components/home/StyleGrid";
import WhyShopWithUs from "@/components/home/WhyShopWithUs";
import InspirationGallery from "@/components/home/InspirationGallery";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AboutSection />
        <CategoryGrid />
        <FeaturedProducts />
        <StyleGrid />
        <WhyShopWithUs />
        <InspirationGallery />
      </main>
      <Footer />
    </>
  );
}
