import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountView from "@/components/account/AccountView";

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
        <AccountView />
      </main>
      <Footer />
    </>
  );
}