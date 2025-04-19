import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const StarRating = ({ 
  rating, 
  size = 'md',
  showText = false,
  className = '' 
}: StarRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const starSizeClass = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];
  
  return (
    <div className={`flex items-center ${className}`}>
      {/* Full stars */}
      {Array(fullStars).fill(0).map((_, i) => (
        <Star 
          key={`full-${i}`} 
          className={`${starSizeClass} text-yellow-400 fill-yellow-400`} 
        />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <StarHalf
          className={`${starSizeClass} text-yellow-400 fill-yellow-400`}
        />
      )}
      
      {/* Empty stars */}
      {Array(emptyStars).fill(0).map((_, i) => (
        <Star 
          key={`empty-${i}`} 
          className={`${starSizeClass} text-gray-300`} 
        />
      ))}
      
      {/* Rating text */}
      {showText && (
        <span className="ml-1 text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;