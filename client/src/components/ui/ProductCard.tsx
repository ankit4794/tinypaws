import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { id, name, slug, price, originalPrice, images, rating, reviewCount } = product;
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: isWishlisted ? `${name} has been removed from your wishlist` : `${name} has been added to your wishlist`,
      variant: "default",
    });
  };
  
  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    
    toast({
      title: "Added to Cart",
      description: `${name} has been added to your cart`,
      variant: "default",
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star text-yellow-400 text-sm"></i>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400 text-sm"></i>);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-yellow-400 text-sm"></i>);
    }
    
    return stars;
  };

  return (
    <div className="group">
      <div className="relative mb-3 overflow-hidden rounded-lg">
        <Link href={`/product/${slug}`}>
          <img 
            src={images[0]}
            alt={name}
            className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
          />
        </Link>
        <button 
          className={`absolute top-3 right-3 bg-white rounded-full p-2 ${isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition duration-300 hover:bg-gray-100`}
          onClick={handleAddToWishlist}
        >
          <i className={isWishlisted ? "fas fa-heart text-red-600" : "far fa-heart"}></i>
        </button>
      </div>
      
      <div>
        <h3 className="font-medium text-gray-800 mb-1">{name}</h3>
        <div className="flex items-center space-x-1 mb-1">
          {renderStars(rating)}
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold">₹{price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-gray-500 line-through text-sm ml-2">₹{originalPrice}</span>
            )}
          </div>
          <button 
            className="text-sm bg-black text-white rounded px-3 py-1 hover:bg-gray-800 transition"
            onClick={handleQuickAddToCart}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
