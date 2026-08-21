import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TankCalculatorView from "@/components/calculator/TankCalculatorView";

export const metadata: Metadata = {
  title: "Aquascaping Tank & Substrate Calculator | Aquaku Shop",
  description:
    "Calculate aquarium volume, substrate soil bags, canister filter turnover, lighting lumens/watts, and CO2 injection bubble rates for standard and custom aquascapes.",
};

export default function TankCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low">
        <TankCalculatorView />
      </main>
      <Footer />
    </>
  );
}
