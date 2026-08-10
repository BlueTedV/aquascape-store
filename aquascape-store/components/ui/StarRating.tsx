import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
}

export default function StarRating({ rating, reviewCount }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-on-surface-variant/40"
          }
        />
      ))}
      {typeof reviewCount === "number" && (
        <span className="ml-1 text-xs text-on-surface-variant">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
