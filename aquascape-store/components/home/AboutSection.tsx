import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Leaf, Sparkles } from "lucide-react";
import SectionReveal from "@/components/ui/SectionReveal";

const stats = [
  { value: "13+", label: "Years Sourcing" },
  { value: "40K+", label: "Tanks Supplied" },
  { value: "300+", label: "Plant & Livestock Species" },
  { value: "0%", label: "Wild-Caught Fauna" },
];

const highlights = [
  {
    icon: Leaf,
    title: "2-Week Nursery Quarantine",
    desc: "Every plant is checked leaf by leaf for pests before shipping.",
  },
  {
    icon: ShieldCheck,
    title: "100% Captive-Bred",
    desc: "All fish & shrimp are sustainably bred without harming wild ecosystems.",
  },
  {
    icon: Sparkles,
    title: "Hand-Picked Hardscape",
    desc: "Stones & driftwood hand-selected for unique texture, grain, and structure.",
  },
];

export default function AboutSection() {
  return (
    <SectionReveal as="section" className="bg-surface-container-low py-section-gap-mobile md:py-section-gap">
      <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg shadow-soft">
            <Image
              src="/images/home/About.jpg"
              alt="A finished planted aquarium on a minimalist wood stand in a home living room"
              width={900}
              height={700}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-stack-md">
            <span className="block font-sans text-label-md uppercase tracking-wider text-tertiary">
              Why Aquaku Shop
            </span>
            <h2 className="font-display text-headline-lg text-primary">
              Craftsmanship & Biological Integrity
            </h2>
            <p className="font-sans text-body-md text-on-surface-variant md:text-body-lg">
              We believe a great aquascape is equal parts biology, geology,
              and patience. Our mission is giving you pristine materials worthy of the vision in your head.
            </p>

            <div className="space-y-4 pt-2">
              {highlights.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-on-surface">
                        {item.title}
                      </h3>
                      <p className="font-sans text-body-md text-on-surface-variant">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-sans font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
              >
                <span>Read Our Full Story</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-stack-lg grid grid-cols-2 gap-gutter rounded-lg bg-background-white p-stack-lg shadow-soft md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-headline-lg text-primary">
                {stat.value}
              </div>
              <div className="mt-1 font-sans text-body-md text-on-surface-variant">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

