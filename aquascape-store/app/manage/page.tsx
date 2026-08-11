import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Management | Aquaku Shop",
  description: "Admin product catalog and order management for Aquaku Shop.",
};

export default function ManagePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
        <AdminDashboard />
      </main>
      <Footer />
    </>
  );
}