import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/AboutSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BuildGuide from "@/components/home/BuildGuide";
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
        <BuildGuide />
        <StyleGrid />
        <WhyShopWithUs />
        <InspirationGallery />
      </main>
      <Footer />
    </>
  );
}
