import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Helmet } from "react-helmet";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ui/ProductCard";
import QuickViewModal from "@/components/ui/QuickViewModal";
import { useProduct, useProductBySlug, useProducts } from "@/hooks/use-products";

const ProductDetailPage = () => {
  const params = useParams();
  const { id, slug } = params;
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

  // Use appropriate hook based on whether we have an ID or slug
  const productById = useProduct(id || '');
  const productBySlug = useProductBySlug(slug || '');

  console.log(productBySlug, "productBySlug")
  
  // Determine which product data to use
  const productData = slug ? productBySlug : productById;
  const { data: product, isLoading, error } = productData;

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
      <Helmet>
        <title>{`${product.name} | TinyPaws`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-black">Home</a>
          <span className="mx-2">/</span>
          <a href={`/products/${product.category || 'all'}`} className="hover:text-black">
            {product.category && typeof product.category === 'string' 
              ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
              : 'All Categories'}
          </a>
          {product.subcategory && (
            <>
              <span className="mx-2">/</span>
              <a href={`/products/${product.category || 'all'}/${product.subcategory}`} className="hover:text-black">
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
              {activeImage ? (
                <img 
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-auto object-contain aspect-square"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-gray-100 text-gray-500">
                  No image available
                </div>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
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
                ))
              ) : (
                <div className="text-gray-500 col-span-5 text-center py-4">
                  No product images available
                </div>
              )}
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Customer Reviews</h3>
                  <Button>Write a Review</Button>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <div className="text-3xl font-bold">{product.rating ? product.rating.toFixed(1) : "0.0"}</div>
                    <div className="flex">
                      {renderStars(product.rating || 0)}
                    </div>
                    <div className="text-sm text-gray-500">{product.reviewCount || 0} reviews</div>
                  </div>
                  
                  <div className="flex-grow">
                    {/* Rating Bars */}
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center mb-1">
                        <span className="text-sm w-10">{star} star</span>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                          <div 
                            className="bg-yellow-400 h-2.5 rounded-full" 
                            style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1}%` }}
                          ></div>
                        </div>
                        <span className="text-sm w-10">{star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Sample Reviews */}
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Rahul K.</h4>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>
                    <div className="flex mb-2">
                      {renderStars(5)}
                    </div>
                    <p>Great product! My dog loves it. The quality is excellent and it's very durable. Would definitely recommend to other pet owners.</p>
                  </div>
                  
                  <div className="border-b pb-6">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Priya S.</h4>
                      <span className="text-sm text-gray-500">1 month ago</span>
                    </div>
                    <div className="flex mb-2">
                      {renderStars(4)}
                    </div>
                    <p>Really good quality product. My pet enjoys it a lot. The only reason I'm giving 4 stars is because the color is slightly different from what was shown online.</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Ananya J.</h4>
                      <span className="text-sm text-gray-500">2 months ago</span>
                    </div>
                    <div className="flex mb-2">
                      {renderStars(5)}
                    </div>
                    <p>Excellent product and very fast delivery! My cat absolutely loves it. The material is high-quality and seems very durable. Will definitely be ordering more products from TinyPaws!</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="py-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Shipping & Returns</h3>
                
                <h4 className="font-medium mt-6 mb-2">Shipping Policy</h4>
                <p>We offer free shipping on orders above ₹999. Standard delivery takes 2-5 business days depending on your location. For select pincode areas, we also offer express delivery within 24-48 hours at an additional cost.</p>
                
                <h4 className="font-medium mt-6 mb-2">Return Policy</h4>
                <p>If you're not completely satisfied with your purchase, you can return it within 7 days of delivery. The product must be unused and in its original packaging. Please note that shipping charges for returns are borne by the customer unless the return is due to a defect or error on our part.</p>
                
                <h4 className="font-medium mt-6 mb-2">Refund Policy</h4>
                <p>Once we receive and inspect the returned item, we will process your refund. The refund will be credited back to your original payment method within 5-7 business days.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoadingSimilar ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
                ))
              ) : (
                similarProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        )}
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
