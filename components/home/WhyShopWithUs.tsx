import { Leaf, PackageCheck, Truck, Headset } from "lucide-react";
import SectionReveal from "@/components/ui/SectionReveal";

const features = [
  {
    icon: Leaf,
    title: "Healthy Plants",
    description: "Guaranteed pest-free and laboratory tissue-cultured varieties.",
  },
  {
    icon: PackageCheck,
    title: "Secure Packaging",
    description: "Specialized thermo-insulation for live plants and fish.",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Reliable delivery across the Indonesian archipelago.",
  },
  {
    icon: Headset,
    title: "Expert Support",
    description: "Professional guidance from scapers with 10+ years experience.",
  },
];

export default function WhyShopWithUs() {
  return (
    <SectionReveal
      as="section"
      className="bg-primary-container py-section-gap-mobile text-on-primary md:py-section-gap"
    >
      <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center"
            >
              <feature.icon size={44} className="mb-stack-md text-primary-fixed" />
              <h4 className="mb-2 font-display text-headline-md">
                {feature.title}
              </h4>
              <p className="font-sans text-body-md opacity-80">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
