import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountView from "@/components/account/AccountView";

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-28 pt-20 sm:pt-28 md:px-edge-margin-desktop">
        <AccountView />
      </main>
      <Footer />
    </>
  );
}