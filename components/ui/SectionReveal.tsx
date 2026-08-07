"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}

/**
 * Wraps a section and fades/slides it into view the first time it enters the
 * viewport. Mirrors the IntersectionObserver behavior from the original
 * static mockup, reimplemented as a small reusable client component.
 */
export default function SectionReveal({
  children,
  className = "",
  as = "div",
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
