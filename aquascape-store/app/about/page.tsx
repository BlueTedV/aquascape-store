import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Award, HeartHandshake, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionReveal from "@/components/ui/SectionReveal";

export const metadata = {
  title: "About Us | Aquaku Shop",
  description: "Learn about Aquaku Shop's origin story, nursery quarantine process, and commitment to sustainable aquascaping in Indonesia.",
};

const stats = [
  { value: "2011", label: "Year Founded" },
  { value: "40K+", label: "Tanks Supplied" },
  { value: "300+", label: "Species Cultivated" },
  { value: "0%", label: "Wild-Caught Fauna" },
];

const pillars = [
  {
    icon: Leaf,
    title: "Rigorous 2-Week Quarantine",
    desc: "Every aquatic plant imported or cultivated in our Bandung nursery passes through a strict 14-day quarantine, inspected leaf-by-leaf to guarantee pest-free, snail-free, and algae-free specimens.",
  },
  {
    icon: ShieldCheck,
    title: "100% Captive-Bred Guarantee",
    desc: "We strictly refrain from wild-harvesting fish or shrimp. All livestock sold by Aquaku Shop is captive-bred by verified ethical breeders to protect natural freshwater ecosystems.",
  },
  {
    icon: Sparkles,
    title: "Artisanal Hardscape Selection",
    desc: "Stones and driftwood are never sold strictly by bulk weight. Our team inspects grain, texture, scale, and natural balance so every piece you receive has character.",
  },
  {
    icon: HeartHandshake,
    title: "Lifetime Scaper Support",
    desc: "Whether you are balancing CO2 for the first time or combating staghorn algae, our team of seasoned aquascapers provides personalized advice long after your purchase.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-surface-container-low py-16 md:py-24">
          <div className="mx-auto max-w-container px-edge-margin-mobile text-center md:px-edge-margin-desktop">
            <span className="font-sans text-label-md uppercase tracking-wider text-tertiary">
              Our Journey & Philosophy
            </span>
            <h1 className="mt-2 font-display text-display-md font-bold text-primary md:text-display-lg">
              Bringing Living Art Into Modern Spaces
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-body-md text-on-surface-variant md:text-body-lg">
              What started as a single 60cm tank in a spare bedroom in Bandung has grown into Indonesia&apos;s home for serious aquascaping.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <SectionReveal as="section" className="py-section-gap-mobile md:py-section-gap">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <div className="grid grid-cols-1 items-center gap-gutter md:grid-cols-2">
              <div className="relative overflow-hidden rounded-xl shadow-soft">
                <Image
                  src="/images/home/about.svg"
                  alt="Aquaku Nursery and Aquascape Gallery"
                  width={900}
                  height={700}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-stack-md">
                <span className="block font-sans text-label-md uppercase tracking-wider text-tertiary">
                  The Founder&apos;s Story
                </span>
                <h2 className="font-display text-headline-lg text-primary">
                  Driven by an Unyielding Obsession with Nature
                </h2>
                <p className="font-sans text-body-md text-on-surface-variant md:text-body-lg">
                  In 2011, Andra Wicaksono set up his first planted aquarium. Struggling to find clean, pest-free plants and high-grade hardscape materials locally, he began sourcing and quarantining plants for himself and fellow hobbyists in West Java.
                </p>
                <p className="font-sans text-body-md text-on-surface-variant md:text-body-lg">
                  Over a decade later, Aquaku Shop has supplied over 40,000 aquascapers across Indonesia, from nano-tank beginners to international competitive aquascapers. But our core obsession hasn&apos;t changed: providing materials worthy of the vision in your head.
                </p>

                <blockquote className="border-l-4 border-primary bg-surface-container-low p-4 italic font-sans text-body-md text-on-surface rounded-r-md">
                  &ldquo;We don&apos;t just sell tanks and supplies. We sell the first ten minutes of quiet you get staring into a thriving ecosystem after a long day.&rdquo;
                  <footer className="mt-2 not-italic text-label-md font-semibold text-primary">
                    — Andra Wicaksono, Founder &amp; Head Aquascaper
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Stats Grid */}
        <section className="bg-primary py-12 text-on-primary">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-headline-lg font-bold md:text-display-md">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-sans text-body-md opacity-90">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars / Quality Guarantees */}
        <SectionReveal as="section" className="py-section-gap-mobile md:py-section-gap">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <div className="text-center">
              <span className="font-sans text-label-md uppercase tracking-wider text-tertiary">
                Our Standards
              </span>
              <h2 className="mt-1 font-display text-headline-lg text-primary">
                Why Scapers Trust Aquaku Shop
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-low p-6 transition-all hover:shadow-md"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <IconComponent size={24} />
                    </div>
                    <h3 className="font-sans text-title-md font-bold text-on-surface">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 font-sans text-body-md text-on-surface-variant">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionReveal>

        {/* CTA Banner */}
        <section className="bg-surface-container-high py-16">
          <div className="mx-auto max-w-container px-edge-margin-mobile text-center md:px-edge-margin-desktop">
            <h2 className="font-display text-headline-lg text-primary">
              Ready to Start Your Next Aquascape Project?
            </h2>
            <p className="mx-auto mt-2 max-w-xl font-sans text-body-md text-on-surface-variant">
              Explore our hand-picked hardscape, tissue-culture plants, and premium equipment.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-sans font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
              >
                <span>Browse Shop</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 rounded-md border border-outline px-6 py-3 font-sans font-medium text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <span>View Setup Guides</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
