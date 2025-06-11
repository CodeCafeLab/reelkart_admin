
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingDisplayProps {
  rating?: number | null; // Expected to be 0-5
  totalStars?: number;
  starSize?: string; // e.g., "h-4 w-4"
  className?: string;
}

export function StarRatingDisplay({
  rating,
  totalStars = 5,
  starSize = "h-4 w-4", // Default size
  className,
}: StarRatingDisplayProps) {
  // Validate and clamp the rating
  const validRating = typeof rating === 'number' 
    ? Math.max(0, Math.min(rating, totalStars)) 
    : null;

  if (validRating === null) {
    return <span className={cn("text-xs text-muted-foreground", className)}>N/A</span>;
  }

  const fullStars = Math.floor(validRating);
  // For simplicity, we are not implementing half stars. 
  // If validRating is 4.5, it will show 4 full stars.

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(totalStars)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
            i < fullStars ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
          )}
        />
      ))}
    </div>
  );
}
