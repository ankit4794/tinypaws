import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState<string>("red");
  const [selectedSize, setSelectedSize] = useState<string>("medium");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product.images[0]);
  const [pincode, setPincode] = useState<string>("");
  const [isDeliverable, setIsDeliverable] = useState<boolean | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState<boolean>(false);

  const { name, price, originalPrice, description, images } = product;

  const colorOptions = [
    { name: "Red", value: "red", color: "bg-red-500" },
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "Green", value: "green", color: "bg-green-500" },
    { name: "Black", value: "black", color: "bg-black" },
  ];

  const sizeOptions = [
    { name: "Small", value: "small" },
    { name: "Medium", value: "medium" },
    { name: "Large", value: "large" },
  ];

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      selectedColor,
      selectedSize,
    });
    
    toast({
      title: "Added to Cart",
      description: `${quantity} ${name} added to your cart`,
      variant: "default",
    });
    
    onClose();
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleCheckDelivery = async () => {
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingDelivery(true);
    
    try {
      // This would be an API call in production
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple logic for demo: even last digit means deliverable
      const lastDigit = parseInt(pincode.slice(-1));
      setIsDeliverable(lastDigit % 2 === 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check delivery availability",
        variant: "destructive",
      });
    } finally {
      setIsCheckingDelivery(false);
    }
  };

  const discountPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={activeImage}
                alt={name}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div 
                  key={index}
                  className={`rounded-lg overflow-hidden border ${activeImage === image ? 'border-black' : 'border-gray-200'} hover:border-black cursor-pointer`}
                  onClick={() => setActiveImage(image)}
                >
                  <img 
                    src={image}
                    alt={`${name} view ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{name}</h2>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {Array.from({ length: Math.floor(product.rating) }).map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400"></i>
                ))}
                {product.rating % 1 !== 0 && (
                  <i className="fas fa-star-half-alt text-yellow-400"></i>
                )}
                {Array.from({ length: 5 - Math.ceil(product.rating) }).map((_, i) => (
                  <i key={`empty-${i}`} className="far fa-star text-yellow-400"></i>
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">({product.reviewCount} reviews)</span>
            </div>
            
            <div className="mb-4">
              <span className="text-2xl font-bold mr-3">₹{price}</span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="text-gray-500 line-through">₹{originalPrice}</span>
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">{description}</p>
              {product.features && (
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Color Selection */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Color</h3>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button 
                    key={color.value}
                    className={`w-8 h-8 rounded-full ${color.color} border-2 border-white ${selectedColor === color.value ? 'ring-2 ring-black' : 'hover:ring-2 hover:ring-gray-400'}`}
                    onClick={() => setSelectedColor(color.value)}
                    aria-label={`Select ${color.name} color`}
                  ></button>
                ))}
              </div>
            </div>
            
            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button 
                    key={size.value}
                    className={`px-4 py-2 ${
                      selectedSize === size.value 
                        ? 'border-2 border-black' 
                        : 'border border-gray-300 hover:border-black'
                    } rounded-md`}
                    onClick={() => setSelectedSize(size.value)}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity and Add to Cart */}
            <div className="flex items-center mb-6">
              <div className="flex items-center border border-gray-300 rounded-md mr-4">
                <button 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  min="1"
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)} 
                  className="w-12 py-1 text-center border-x border-gray-300"
                />
                <button 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <button 
                className="flex-grow bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
            
            {/* Additional Actions */}
            <div className="flex items-center space-x-4 text-sm">
              <button className="flex items-center text-gray-600 hover:text-black">
                <i className="far fa-heart mr-1"></i> Add to Wishlist
              </button>
              <button className="flex items-center text-gray-600 hover:text-black">
                <i className="fas fa-share-alt mr-1"></i> Share
              </button>
            </div>
            
            {/* Delivery Check */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Check Delivery</h3>
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-black"
                  maxLength={6}
                />
                <Button
                  className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 transition"
                  onClick={handleCheckDelivery}
                  disabled={isCheckingDelivery}
                >
                  {isCheckingDelivery ? "Checking..." : "Check"}
                </Button>
              </div>
              
              {isDeliverable === true && (
                <div className="mt-2 text-sm text-green-600">
                  <i className="fas fa-check-circle mr-1"></i> We deliver to your area! Delivery usually takes 2-3 business days.
                </div>
              )}
              
              {isDeliverable === false && (
                <div className="mt-2 text-sm text-red-600">
                  <i className="fas fa-exclamation-circle mr-1"></i> Sorry, we don't deliver to your area yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
