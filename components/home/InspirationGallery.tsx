import Image from "next/image";
import { galleryItems } from "@/data/gallery";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

const aspectClasses: Record<string, string> = {
  tall: "aspect-[4/5]",
  wide: "aspect-[4/3]",
  square: "aspect-square",
};

export default function InspirationGallery() {
  return (
    <SectionReveal
      as="section"
      className="mx-auto max-w-container px-edge-margin-mobile py-section-gap-mobile md:px-edge-margin-desktop md:py-section-gap"
    >
      <SectionHeading
        align="center"
        title="Inspiration Gallery"
        subtitle="Masterpieces by our community and local experts."
      />

      {/* True Pinterest-style masonry via CSS columns, so items of different
          heights sit flush against each other instead of a fixed grid. */}
      <div className="columns-1 gap-gutter sm:columns-2 lg:columns-3">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className={`group relative mb-gutter break-inside-avoid overflow-hidden rounded-lg shadow-soft ${aspectClasses[item.size]}`}
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
              <button
                type="button"
                className="rounded-full bg-white/90 px-6 py-2 font-sans text-label-md text-primary backdrop-blur-md"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionReveal>
  );
}
