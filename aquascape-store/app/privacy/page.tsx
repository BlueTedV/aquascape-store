import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy | Aquaku Shop",
  description: "Read Aquaku Shop's privacy policy to understand how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-surface-container-low py-12 md:py-16">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <h1 className="font-display text-display-sm font-bold text-primary">
              Privacy Policy
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
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">1. Introduction</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aquaku Shop (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website or make a purchase. Please read this policy carefully. If you disagree with its terms, please discontinue use of the site.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">2. Information We Collect</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. We may collect the following types of information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-body-md text-on-surface-variant">
                  <li><span className="font-semibold text-on-surface">Personal Identification:</span> Name, email address, phone number, and billing/shipping address provided when you register or place an order.</li>
                  <li><span className="font-semibold text-on-surface">Transaction Data:</span> Details of purchases, payment method (type, not full card number), and order history.</li>
                  <li><span className="font-semibold text-on-surface">Usage Data:</span> IP address, browser type, pages visited, referring URLs, and timestamps collected automatically via cookies and analytics tools.</li>
                  <li><span className="font-semibold text-on-surface">Communications:</span> Messages you send us via contact forms, email, or live chat.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">3. How We Use Your Information</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-body-md text-on-surface-variant">
                  <li>Process and fulfill your orders and payments.</li>
                  <li>Send order confirmations, shipping updates, and support responses.</li>
                  <li>Improve and personalize your shopping experience on our platform.</li>
                  <li>Analyze website usage to enhance performance and user experience.</li>
                  <li>Send promotional emails and newsletters (only with your consent).</li>
                  <li>Comply with applicable legal obligations and prevent fraud.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">4. Sharing Your Information</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. We do not sell or rent your personal data to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business (e.g., payment processors, shipping carriers, and analytics services), provided they agree to keep your information confidential. We may also disclose your data if required by law or to protect our legal rights.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">5. Cookies and Tracking Technologies</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and remember your preferences. You may choose to disable cookies through your browser settings; however, doing so may affect certain features of the website. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until deleted).
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">6. Data Security</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. We implement a variety of security measures to maintain the safety of your personal information. All payment transactions are encrypted using SSL technology. We do not store credit card numbers on our servers. Despite our efforts, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">7. Your Rights</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. You have the right to access, correct, or delete your personal data that we hold. You may also opt out of receiving marketing emails at any time by clicking the &quot;unsubscribe&quot; link in any email we send. To exercise your rights or submit a data request, please contact us at{" "}
                  <a href="mailto:privacy@aquaku.id" className="text-primary underline hover:opacity-80">
                    privacy@aquaku.id
                  </a>.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">8. Changes to This Policy</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically to stay informed about how we are protecting your information.
                </p>
              </div>

              <div>
                <h2 className="font-display text-headline-md font-bold text-primary mb-3">9. Contact Us</h2>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  If you have any questions or concerns about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@aquaku.id" className="text-primary underline hover:opacity-80">
                    privacy@aquaku.id
                  </a>{" "}
                  or write to us at our registered office in Bandung, Indonesia.
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
