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
      className="bg-primary-container py-6 sm:py-10 md:py-section-gap text-on-primary"
    >
      <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4 md:gap-gutter">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center rounded-xl bg-white/[0.07] border border-white/10 p-3 sm:p-4 md:p-0 md:bg-transparent md:border-none transition-all hover:bg-white/[0.12] md:hover:bg-transparent"
            >
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 mb-2 sm:mb-3 text-primary-fixed shrink-0">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
              </div>
              <h4 className="font-display text-xs sm:text-sm md:text-headline-md font-bold text-white mb-1 leading-tight">
                {feature.title}
              </h4>
              <p className="font-sans text-[11px] sm:text-xs md:text-body-md text-white/80 leading-tight sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
