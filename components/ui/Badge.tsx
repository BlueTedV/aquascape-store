import { ProductBadge } from "@/lib/types";

const styles: Record<ProductBadge, string> = {
  New: "bg-tertiary text-on-tertiary",
  "Best Seller": "bg-secondary text-on-secondary",
  Premium: "bg-primary text-on-primary",
};

export default function Badge({ type }: { type: ProductBadge }) {
  return (
    <span
      className={`absolute left-4 top-4 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[type]}`}
    >
      {type}
    </span>
  );
}
