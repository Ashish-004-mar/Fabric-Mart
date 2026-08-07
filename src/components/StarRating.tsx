import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewsCount?: number;
  interactive?: boolean;
  onChange?: (newRating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = false,
  reviewsCount,
  interactive = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = currentDisplayRating >= starValue;
          const isHalf = !isFilled && currentDisplayRating > index && currentDisplayRating < starValue;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`p-0.5 transition-transform ${
                interactive ? 'cursor-pointer hover:scale-110 focus:outline-none' : 'cursor-default'
              }`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-slate-200 dark:fill-slate-800 text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
          {rating.toFixed(1)}
        </span>
      )}

      {reviewsCount !== undefined && (
        <span className="text-slate-400 text-xs font-normal">
          ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
