import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: { label: string; href: string };
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  action,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`mb-stack-lg flex flex-col gap-stack-sm ${
        isCenter ? "items-center text-center" : "items-start"
      } ${action ? "sm:flex-row sm:items-end sm:justify-between sm:text-left" : ""}`}
    >
      <div className={isCenter ? "flex flex-col items-center" : ""}>
        {eyebrow && (
          <span className="mb-1 block text-label-md font-sans uppercase tracking-wider text-tertiary">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-headline-lg text-primary">
          {title}
        </h2>
        {!isCenter && (
          <div className="mt-stack-sm h-1 w-24 rounded-full bg-primary-fixed" />
        )}
        {subtitle && (
          <p className="mt-stack-sm max-w-xl text-body-md text-on-surface-variant">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group flex shrink-0 items-center gap-1 font-sans text-label-md text-primary hover:underline"
        >
          {action.label}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}
