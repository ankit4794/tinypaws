import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ui/ProductCard";
import QuickViewModal from "@/components/ui/QuickViewModal";
import { useProduct, useProducts } from "@/hooks/use-products";

const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState<string>("red");
  const [selectedSize, setSelectedSize] = useState<string>("medium");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [isDeliverable, setIsDeliverable] = useState<boolean | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState<boolean>(false);
  const [showQuickView, setShowQuickView] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Use our custom hook with caching for the product
  const { data: product, isLoading, error } = useProduct(id as string);

  // Use our custom hook for similar products with caching
  const { data: similarProducts, isLoading: isLoadingSimilar } = useProducts({
    category: product?.category,
    limit: 4,
    enabled: !!product,
  });

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        quantity,
        selectedColor,
        selectedSize,
      });
      
      toast({
        title: "Added to Cart",
        description: `${quantity} ${product.name} added to your cart`,
        variant: "default",
      });
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
      // Make API call to check delivery
      const response = await fetch(`/api/pincode?pincode=${pincode}`);
      const data = await response.json();
      
      setIsDeliverable(data.isDeliverable);
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

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-yellow-400"></i>);
    }
    
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-6" asChild>
          <a href="/products/dogs">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      <Head>
        <title>{`${product.name} | TinyPaws`}</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-black">Home</a>
          <span className="mx-2">/</span>
          <a href={`/products/${product.category ? product.category : ''}`} className="hover:text-black">
            {product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'All Categories'}
          </a>
          {product.subcategory && (
            <>
              <span className="mx-2">/</span>
              <a href={`/products/${product.category ? product.category : ''}/${product.subcategory}`} className="hover:text-black">
                {product.subcategory.charAt(0).toUpperCase() + product.subcategory.slice(1)}
              </a>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={activeImage}
                alt={product.name}
                className="w-full h-auto object-contain aspect-square"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.images && product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`rounded-lg overflow-hidden border ${activeImage === image ? 'border-black' : 'border-gray-200'} hover:border-black cursor-pointer`}
                  onClick={() => setActiveImage(image)}
                >
                  <img 
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-auto object-cover aspect-square"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(product.rating || 0)}
              </div>
              <span className="text-sm text-gray-500 ml-2">({product.reviewCount || 0} reviews)</span>
            </div>
            
            <div className="mb-6">
              <span className="text-2xl font-bold mr-3">₹{product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-gray-500 line-through">₹{product.originalPrice}</span>
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
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
              
              <Button 
                className="flex-grow bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>
            
            {/* Additional Actions */}
            <div className="flex items-center space-x-4 text-sm mb-6">
              <button className="flex items-center text-gray-600 hover:text-black">
                <i className="far fa-heart mr-1"></i> Add to Wishlist
              </button>
              <button className="flex items-center text-gray-600 hover:text-black">
                <i className="fas fa-share-alt mr-1"></i> Share
              </button>
            </div>
            
            {/* Delivery Check */}
            <div className="p-4 bg-gray-50 rounded-md">
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

        {/* Product Details Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <p>{product.description}</p>
                {product.longDescription && (
                  <div className="mt-4" dangerouslySetInnerHTML={{ __html: product.longDescription }} />
                )}
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="py-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Brand</td>
                      <td className="py-2">{product.brand || "TinyPaws"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Material</td>
                      <td className="py-2">Premium Quality</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Weight</td>
                      <td className="py-2">0.5kg</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Dimensions</td>
                      <td className="py-2">25 x 15 x 5 cm</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Country of Origin</td>
                      <td className="py-2">India</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="py-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                <div className="mb-8">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-4">
                      {renderStars(product.rating || 0)}
                    </div>
                    <span className="text-sm">Based on {product.reviewCount || 0} reviews</span>
                  </div>
                  <Button variant="outline">Write a Review</Button>
                </div>
                
                {/* Sample Reviews - would be dynamic in production */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-2">
                        {renderStars(5)}
                      </div>
                      <span className="font-medium">Great product!</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">By John D. on April 12, 2025</p>
                    <p>My dog absolutely loves this. The quality is excellent and it's very durable. Highly recommend!</p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-2">
                        {renderStars(4)}
                      </div>
                      <span className="font-medium">Good value</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">By Sarah M. on March 28, 2025</p>
                    <p>Nice product for the price. My puppy enjoys it. Taking off one star because it's smaller than expected.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="py-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
                <p>We deliver across India. Shipping time depends on your location:</p>
                <ul>
                  <li>Metro cities: 2-3 business days</li>
                  <li>Other cities: 3-5 business days</li>
                  <li>Remote areas: 5-7 business days</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-4">Return Policy</h3>
                <p>If you're not completely satisfied with your purchase, you can return it within 15 days of delivery. Please note that the product must be unused and in its original packaging.</p>
                <p>To initiate a return, please contact our customer support with your order details.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          {isLoadingSimilar ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts?.map((similar) => (
                <ProductCard
                  key={similar._id}
                  product={similar}
                  onQuickView={() => handleQuickView(similar)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
};

export default ProductDetailPage;