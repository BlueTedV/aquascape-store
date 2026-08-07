import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { aquascapeStyles } from "@/data/styles";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

function getStyleTag(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export default function StyleGrid() {
  return (
    <SectionReveal
      as="section"
      className="mx-auto max-w-container px-edge-margin-mobile py-section-gap-mobile md:px-edge-margin-desktop md:py-section-gap"
    >
      <SectionHeading title="Shop by Aquascape Style" />

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {aquascapeStyles.map((style) => (
          <Link
            key={style.id}
            href={`/shop?tag=${getStyleTag(style.slug)}`}
            className="group relative block h-96 overflow-hidden rounded-lg shadow-soft"
          >
            <Image
              src={style.image}
              alt={`${style.name} aquascape style example`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="mb-2 font-display text-headline-md text-white">
                {style.name}
              </h3>
              <span className="flex items-center gap-2 font-sans text-label-md text-white">
                Explore Style
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </SectionReveal>
  );
}
