import Link from "next/link";
import {
  RectangleHorizontal,
  Layers,
  Mountain,
  Sprout,
  Droplets,
  Sun,
  Fish,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionReveal from "@/components/ui/SectionReveal";

export const metadata = {
  title: "Aquascaping Setup Guide | Aquaku Shop",
  description: "Step-by-step expert guide to building and maintaining a thriving planted aquarium ecosystem.",
};

const detailedSteps = [
  {
    step: 1,
    title: "Tank & Position",
    icon: RectangleHorizontal,
    category: "equipment",
    tagline: "Choose ultra-clear low-iron glass and a sturdy level foundation.",
    details: [
      "Select ultra-clear (low-iron) glass tanks for true optical color rendition.",
      "Ensure your stand can support ~1.2kg per liter of total volume.",
      "Place a high-density EVA leveling mat beneath the tank to eliminate point pressure.",
      "Position away from direct direct sunlight to prevent uncontrollable algae blooms.",
    ],
  },
  {
    step: 2,
    title: "Substrate Foundation",
    icon: Layers,
    category: "equipment",
    tagline: "Layer nutrient-rich aqua soil over porous volcanic mineral base.",
    details: [
      "Pour a base layer of porous volcanic lava granules to ensure water circulation to plant roots.",
      "Cover with nutrient-dense active aqua soil to buffer pH (6.0 - 6.8) and provide macro/micro nutrients.",
      "Slope substrate from 3cm in the front to 8cm+ in the back to create natural visual depth.",
    ],
  },
  {
    step: 3,
    title: "Hardscape Structure",
    icon: Mountain,
    category: "hardscape",
    tagline: "Construct natural focal points with inert rocks and root driftwood.",
    details: [
      "Use the Golden Ratio (1:1.618) to position your main focal point off-center.",
      "Select compatible stones (e.g. Dragon Stone, Seiryu, Black Lava) and aged Driftwood.",
      "Use cyanoacrylate gel and cotton fiber to securely bond heavy rock and wood structures.",
    ],
  },
  {
    step: 4,
    title: "Plant Selection & Planting",
    icon: Sprout,
    category: "plants",
    tagline: "Combine foreground carpets, midground epiphytes, and background stems.",
    details: [
      "Use tissue-culture plants for guaranteed pest, snail, and pesticide-free starting material.",
      "Mist substrate thoroughly before planting with fine pinsettes at a 45-degree angle.",
      "Attach epiphytes (Anubias, Bucephalandra, Java Fern) directly onto wood or rock with thread or glue.",
    ],
  },
  {
    step: 5,
    title: "Filtration & CO2 Injection",
    icon: Droplets,
    category: "equipment",
    tagline: "Provide 6-10x hourly turnover and stable carbon dioxide diffusion.",
    details: [
      "Use canister filters packed with high-surface-area biological media.",
      "Maintain 6-10x total tank volume in hourly flow turnover for optimal nutrient distribution.",
      "Inject pressurized CO2 via inline or glass diffusers (target 30ppm / green drop checker).",
    ],
  },
  {
    step: 6,
    title: "Lighting & Nitrogen Cycling",
    icon: Sun,
    category: "equipment",
    tagline: "Schedule 6-8 hours RGB lighting and allow 3-4 weeks for bacterial colonization.",
    details: [
      "Start with a 6-hour daily photoperiod using full-spectrum RGB LED lighting.",
      "Perform 50% water changes twice weekly during the first 3 weeks to flush excess soil nutrients.",
      "Dose nitrifying bacteria daily until Ammonia and Nitrite drop to 0 ppm.",
    ],
  },
  {
    step: 7,
    title: "Livestock Introduction",
    icon: Fish,
    category: "fish",
    tagline: "Introduce clean-up crew algae eaters first, followed by schooling fish.",
    details: [
      "First week post-cycle: Add Amano Shrimp, Otocinclus, and Nerite Snails for algae management.",
      "Second week: Slowly drip-acclimate schooling fish (Cardinals, Harlequin Rasboras, Microdevario).",
      "Feed sparingly once daily to maintain low phosphate and nitrate levels.",
    ],
  },
];

export default function GuidesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Header Section */}
        <section className="bg-surface-container-low py-16 md:py-24">
          <div className="mx-auto max-w-container px-edge-margin-mobile text-center md:px-edge-margin-desktop">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen size={32} />
            </div>
            <span className="mt-4 block font-sans text-label-md uppercase tracking-wider text-tertiary">
              Complete Aquascaping Guide
            </span>
            <h1 className="mt-2 font-display text-display-md font-bold text-primary md:text-display-lg">
              Build Your First Aquascape Step-by-Step
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-body-md text-on-surface-variant md:text-body-lg">
              A thriving planted tank is equal parts art and ecosystem. Follow our 7-step blueprint to design, plant, cycle, and maintain a stunning underwater landscape.
            </p>
          </div>
        </section>

        {/* Steps Detailed Grid */}
        <SectionReveal as="section" className="py-section-gap-mobile md:py-section-gap">
          <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
            <div className="space-y-12">
              {detailedSteps.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.step}
                    id={`step-${item.step}`}
                    className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-soft transition-all md:p-8"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary font-display text-headline-md font-bold">
                        {item.step}
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 text-primary font-semibold">
                              <IconComponent size={20} />
                              <span>Phase {item.step}</span>
                            </div>
                            <h2 className="font-display text-headline-md text-on-surface">
                              {item.title}
                            </h2>
                          </div>

                          <Link
                            href={`/shop?category=${item.category}`}
                            className="inline-flex items-center gap-1 font-sans text-label-md font-medium text-primary hover:underline"
                          >
                            <span>Shop {item.title} Products</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>

                        <p className="font-sans text-body-lg font-medium text-tertiary">
                          {item.tagline}
                        </p>

                        <ul className="space-y-2 pt-2">
                          {item.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 font-sans text-body-md text-on-surface-variant">
                              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionReveal>

        {/* CTA Banner */}
        <section className="bg-primary py-16 text-on-primary">
          <div className="mx-auto max-w-container px-edge-margin-mobile text-center md:px-edge-margin-desktop">
            <h2 className="font-display text-headline-lg font-bold">
              Need Personalized Guidance for Your Tank Setup?
            </h2>
            <p className="mx-auto mt-2 max-w-xl font-sans text-body-md opacity-90">
              Our Bandung nursery team offers expert advice on plant selection, hardscape composition, and water parameter balancing.
            </p>
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-background-white px-6 py-3 font-sans font-medium text-primary shadow-md transition-colors hover:bg-surface-container-low"
              >
                <span>Explore Aquascaping Supplies</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
