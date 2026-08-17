import Link from "next/link";
import { Instagram, Facebook, Youtube, CreditCard, Landmark } from "lucide-react";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Community Hub", href: "/community" },
  { label: "Aquascape Guides", href: "/guides" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact Support", href: "/contact" },
];


const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="mt-section-gap bg-inverse-surface text-inverse-on-surface">
      <div className="mx-auto max-w-container px-edge-margin-mobile py-stack-lg md:px-edge-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
          <div className="space-y-stack-md">
            <div className="font-display text-headline-md font-bold text-primary-fixed">
              AQUAKU SHOP
            </div>
            <p className="font-sans text-body-md opacity-80">
              Premium aquascaping materials and biological integrity. Designing
              living art for modern spaces, shipped across Indonesia.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="font-sans text-label-md uppercase tracking-wider">
              Quick Links
            </h5>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-body-md opacity-70 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="font-sans text-label-md uppercase tracking-wider">
              Follow Us
            </h5>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="opacity-70 transition-opacity hover:opacity-100"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="opacity-70 transition-opacity hover:opacity-100"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="opacity-70 transition-opacity hover:opacity-100"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-sans text-label-md uppercase tracking-wider">
              Payment Methods
            </h5>
            <div className="flex gap-4 opacity-50">
              <CreditCard size={20} />
              <Landmark size={20} />
            </div>
          </div>
        </div>

        <div className="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-stack-md md:flex-row">
          <p className="font-sans text-sm opacity-60">
            &copy; {new Date().getFullYear()} Aquaku Shop Indonesia.
          </p>
          <div className="flex gap-6 text-sm opacity-60">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
