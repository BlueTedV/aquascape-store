import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthForm from "@/components/auth/AuthForm";

function AuthFormFallback() {
  return <div className="mx-auto h-[560px] w-full max-w-md rounded-lg bg-background-white shadow-soft" />;
}

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
        <Suspense fallback={<AuthFormFallback />}>
          <AuthForm mode="register" />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
