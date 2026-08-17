import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Shipping Policy | Aquaku Shop",
  description: "Learn about Aquaku Shop's shipping methods, delivery times, and policies for orders across Indonesia.",
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-surface-container-low py-12 md:py-16">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <h1 className="font-display text-display-sm font-bold text-primary">
              Shipping Policy
            </h1>
            <p className="mt-2 font-sans text-body-md text-on-surface-variant">
              Last updated: August 17, 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <div className="prose prose-neutral max-w-none space-y-8 font-sans text-on-surface">

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">1. Shipping Areas</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. We currently ship to all major cities and regions across Indonesia, including Java, Sumatra, Kalimantan, Sulawesi, and Bali. Remote areas may be subject to additional delivery time and fees. Please check availability at checkout.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">2. Processing Time</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Orders are typically processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day. You will receive a shipping confirmation email with a tracking number once your order has been dispatched.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">3. Delivery Timeframes</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-3">
                  Estimated delivery times vary based on your location and the shipping method selected at checkout:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-body-md text-on-surface-variant">
                  <li><span className="font-semibold text-on-surface">Same-Day / Next-Day (Jabodetabek):</span> 1 business day</li>
                  <li><span className="font-semibold text-on-surface">Regular (Java & Bali):</span> 2–4 business days</li>
                  <li><span className="font-semibold text-on-surface">Inter-Island (Sumatra, Kalimantan, Sulawesi):</span> 4–7 business days</li>
                  <li><span className="font-semibold text-on-surface">Remote / Eastern Indonesia:</span> 7–14 business days</li>
                </ul>
                <p className="mt-3 text-body-md text-on-surface-variant leading-relaxed">
                  These are estimates only. Actual delivery times may vary due to weather, peak seasons, or carrier delays beyond our control.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">4. Shipping Rates</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Shipping rates are calculated at checkout based on the total weight of your order and your delivery address. We offer free shipping on orders above a minimum threshold (as displayed on the checkout page and promotions). Special rates may apply for bulky items such as aquarium tanks and equipment.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">5. Live Animal & Plant Shipping</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. All live plants and aquatic animals (fish, shrimp, snails) are packaged with specialized materials to ensure their health and safety during transit. We use insulated packaging, oxygen bags, and heat/cold packs as needed. Due to the perishable nature of live goods, we are unable to guarantee live arrival on orders shipped to very remote areas. Please contact us before ordering if you are unsure about shipping conditions to your location.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">6. Order Tracking</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Once your order is shipped, you will receive an email with a tracking number and a link to track your package. You can also track your order by visiting the Track Order page on our website. Please allow up to 24 hours for tracking information to become active.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">7. Damaged or Lost Packages</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. If your order arrives damaged or is lost in transit, please contact our support team within 48 hours of the expected delivery date. We will work with the carrier to resolve the issue and, where applicable, arrange a replacement or refund. Please retain all original packaging materials and take photos of any damage for your claim.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">8. Contact Us</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  If you have any questions about our shipping policy, please reach out to our support team at{" "}
                  <a href="mailto:support@aquaku.id" className="text-primary underline hover:opacity-80">
                    support@aquaku.id
                  </a>{" "}
                  or via our contact page. We are happy to help.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
