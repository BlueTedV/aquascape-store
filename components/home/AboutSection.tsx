import Image from "next/image";
import SectionReveal from "@/components/ui/SectionReveal";

const stats = [
  { value: "13", label: "Years Sourcing" },
  { value: "40K+", label: "Tanks Supplied" },
  { value: "300+", label: "Plant & Livestock Species" },
  { value: "0%", label: "Wild-Caught Fauna" },
];

export default function AboutSection() {
  return (
    <SectionReveal as="section" className="bg-surface-container-low py-section-gap-mobile md:py-section-gap">
      <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
        <div className="grid grid-cols-1 items-center gap-gutter md:grid-cols-2">
          <div className="overflow-hidden rounded-lg shadow-soft">
            <Image
              src="https://picsum.photos/seed/aqua-about/900/700"
              alt="A finished planted aquarium on a minimalist wood stand in a home living room"
              width={900}
              height={700}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-stack-md">
            <span className="block font-sans text-label-md uppercase tracking-wider text-tertiary">
              Our Story
            </span>
            <h2 className="font-display text-headline-lg text-primary">
              Bringing Nature Home
            </h2>
            <p className="font-sans text-body-md text-on-surface-variant md:text-body-lg">
              What started in 2011 as a single 60cm tank in a spare bedroom
              in Bandung has grown into Indonesia&apos;s home for serious
              aquascaping — but the obsession hasn&apos;t changed. Every
              stone we sell is hand-picked for grain and shape, not just
              weight. Every plant leaves our nursery only after two weeks of
              quarantine, checked leaf by leaf for pests. Every fish and
              shrimp is captive-bred, so your tank thrives without cost to a
              river somewhere else.
            </p>
            <p className="font-sans text-body-md text-on-surface-variant md:text-body-lg">
              We believe a great aquascape is equal parts biology, geology,
              and patience — and that our job is simply to give you
              materials worthy of the vision in your head.
            </p>

            <blockquote className="border-l-2 border-primary-fixed py-1 pl-stack-md font-sans text-body-md italic text-on-surface">
              &ldquo;We don&apos;t sell tanks. We sell the first ten minutes
              of quiet you get staring into one.&rdquo;
              <footer className="mt-2 not-italic text-label-md text-on-surface-variant">
                — Andra Wicaksono, Founder &amp; Head Aquascaper
              </footer>
            </blockquote>
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
