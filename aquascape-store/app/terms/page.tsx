import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Terms of Service | Aquaku Shop",
  description: "Read the terms and conditions governing your use of Aquaku Shop and the purchase of our products.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-surface-container-low py-12 md:py-16">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <h1 className="font-display text-display-sm font-bold text-primary">
              Terms of Service
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
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">1. Acceptance of Terms</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. By accessing or using the Aquaku Shop website (&quot;Site&quot;) or purchasing any products from us, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Site. We reserve the right to update these Terms at any time, and continued use of the Site constitutes your acceptance of the updated Terms.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">2. Eligibility</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. You must be at least 17 years of age to use our Site and make purchases. By using the Site, you represent that you meet this age requirement and that all information you provide is accurate and complete. Aquaku Shop reserves the right to refuse service to anyone at its discretion.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">3. Products and Pricing</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. We strive to display accurate descriptions and prices for all products on our Site. However, we reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice. Prices are displayed in Indonesian Rupiah (IDR) and are subject to change without notice. We reserve the right to limit quantities and to discontinue any product.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">4. Orders and Payment</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. By placing an order, you make an offer to purchase a product. We reserve the right to accept or decline your order for any reason. Payment must be made in full before an order is processed. We accept payment via the methods listed at checkout. In the event of a payment failure or dispute, your order may be cancelled or delayed.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">5. Returns and Refunds</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Due to the perishable nature of live aquatic plants and animals, returns are generally not accepted unless the item arrived damaged or significantly different from the product description. Claims for damaged or incorrect items must be submitted within 48 hours of delivery with supporting photographs. Approved refunds will be processed to the original payment method within 7–14 business days. Non-live goods (equipment, hardscape) may be returned in original, unused condition within 7 days of receipt.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">6. User Accounts</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. To access certain features of our Site, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. Aquaku Shop reserves the right to terminate accounts that violate these Terms or engage in fraudulent activity.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">7. Intellectual Property</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. All content on this Site, including text, images, graphics, logos, and software, is the property of Aquaku Shop or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content on this Site without our express written permission.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">8. Limitation of Liability</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. To the fullest extent permitted by law, Aquaku Shop shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or any products purchased from us. Our total liability for any claim shall not exceed the amount you paid for the relevant product. We are not responsible for losses resulting from the death of live animals or plants due to improper care after delivery.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">9. Governing Law</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. These Terms shall be governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Bandung, West Java, Indonesia.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">10. Contact Us</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at{" "}
                  <a href="mailto:legal@aquaku.id" className="text-primary underline hover:opacity-80">
                    legal@aquaku.id
                  </a>{" "}
                  or visit our contact page. We will respond to all inquiries within 3 business days.
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
