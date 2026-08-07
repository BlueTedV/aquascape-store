import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <header className="relative flex h-screen min-h-[640px] items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://picsum.photos/seed/aqua-hero/1600/1000"
          alt="A masterfully crafted nature-style aquascape with driftwood, moss, and schooling tetras in a frameless glass aquarium"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
        <div className="max-w-2xl text-white">
          <h1 className="mb-stack-md font-display text-display-lg-mobile md:text-display-lg">
            Create Your Underwater World
          </h1>
          <p className="mb-stack-lg font-sans text-body-md text-white/90 md:text-body-lg">
            Premium aquatic plants, hardscape, fish, shrimp, and professional
            aquascaping equipment for the modern hobbyist.
          </p>
          <div className="flex flex-wrap gap-stack-md">
            <Link
              href="/shop"
              className="rounded bg-primary px-10 py-4 font-sans text-label-md text-on-primary shadow-lg transition-colors hover:bg-primary-container"
            >
              Shop Now
            </Link>
            <Link
              href="/styles"
              className="rounded border-2 border-white/50 px-10 py-4 font-sans text-label-md text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-primary"
            >
              Explore Aquascapes
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
