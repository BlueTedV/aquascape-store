import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildSteps } from "@/data/buildSteps";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

export default function BuildGuide() {
  return (
    <SectionReveal
      as="section"
      className="mx-auto max-w-container px-edge-margin-mobile py-section-gap-mobile md:px-edge-margin-desktop md:py-section-gap"
    >
      <SectionHeading
        align="center"
        title="Build Your First Aquascape"
        subtitle="Follow our expert 7-step guide to a thriving ecosystem."
      />

      <div className="-mx-edge-margin-mobile overflow-x-auto px-edge-margin-mobile md:mx-0 md:px-0">
        <div className="flex min-w-[840px] items-center justify-between gap-2 md:min-w-0">
          {buildSteps.map((item, i) => {
            const Icon = Icons[
              item.icon as keyof typeof Icons
            ] as unknown as LucideIcon;

            return (
              <div key={item.id} className="flex flex-1 items-center">
                <div className="group flex w-24 flex-col items-center md:w-32">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant shadow-soft transition-colors group-hover:bg-primary group-hover:text-on-primary">
                    <Icon size={28} />
                  </div>
                  <span className="text-center font-sans text-label-md text-on-surface">
                    {item.step}. {item.title}
                  </span>
                </div>
                {i < buildSteps.length - 1 && (
                  <div className="mx-2 h-0.5 flex-grow border-t-2 border-dashed border-outline-variant" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SectionReveal>
  );
}
