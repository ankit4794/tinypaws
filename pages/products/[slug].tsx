import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Loader2, 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck,
  ShieldCheck,
  RotateCcw,
  CircleHelp
} from 'lucide-react';

export default function ProductDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product details
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/products/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/products/slug/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
  });

  // Fetch similar products
  const {
    data: similarProducts,
    isLoading: isSimilarLoading,
  } = useQuery({
    queryKey: [`/api/products/similar/${product?.id}`],
    queryFn: async () => {
      if (!product?.id) return [];
      const res = await fetch(`/api/products/similar/${product.id}`);
      if (!res.ok) throw new Error('Failed to fetch similar products');
      return res.json();
    },
    enabled: !!product?.id,
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">
              Sorry, the product you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => router.push('/products')}>
              Back to Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} | TinyPaws</title>
        <meta name="description" content={product.description || `Buy ${product.name} from TinyPaws`} />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {/* Breadcrumbs */}
          <div className="bg-gray-50 py-4">
            <div className="container px-4 mx-auto">
              <nav className="text-sm breadcrumbs">
                <ul className="flex gap-2">
                  <li><Link href="/" className="text-gray-500 hover:text-black">Home</Link></li>
                  <li className="before:content-['/'] before:mx-2 before:text-gray-400">
                    <Link href="/products" className="text-gray-500 hover:text-black">Products</Link>
                  </li>
                  <li className="before:content-['/'] before:mx-2 before:text-gray-400">
                    <Link href={`/products?category=${product.category}`} className="text-gray-500 hover:text-black">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Link>
                  </li>
                  <li className="before:content-['/'] before:mx-2 before:text-gray-400">
                    <span className="text-black">{product.name}</span>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Product Detail */}
          <section className="py-12">
            <div className="container px-4 mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Product Images */}
                <div>
                  <div className="relative mb-4 h-96 overflow-hidden rounded-lg border">
                    <img 
                      src={product.images[activeImageIndex]} 
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                    {product.originalPrice && (
                      <span className="absolute top-4 right-4 bg-black text-white text-xs font-medium px-2 py-1 rounded">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {product.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`border rounded-md overflow-hidden h-20 ${
                            activeImageIndex === index ? 'ring-2 ring-black' : ''
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`${product.name} view ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-2xl font-bold">
                      ₹{(product.price / 100).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-gray-500 text-lg line-through">
                        ₹{(product.originalPrice / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {product.description}
                  </p>
                  
                  {/* Product Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Key Features</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.features.map((feature: string, index: number) => (
                          <li key={index} className="text-gray-600">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Quantity</h3>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center border rounded-l-md disabled:opacity-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="w-16 h-10 border-t border-b text-center"
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 flex items-center justify-center border rounded-r-md disabled:opacity-50"
                      >
                        +
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        {product.stock} available
                      </span>
                    </div>
                  </div>
                  
                  {/* Add to Cart and Wishlist */}
                  <div className="flex gap-3 mb-8">
                    <Button 
                      className="flex-1 flex items-center gap-2"
                      size="lg"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <Heart className="h-5 w-5" />
                      Add to Wishlist
                    </Button>
                  </div>
                  
                  {/* Delivery Options */}
                  <div className="border rounded-md p-4 mb-6">
                    <h3 className="text-lg font-medium mb-3">Delivery & Returns</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Free Delivery</h4>
                          <p className="text-sm text-gray-600">On orders above ₹999</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Quality Guarantee</h4>
                          <p className="text-sm text-gray-600">Verified product quality</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RotateCcw className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Easy Returns</h4>
                          <p className="text-sm text-gray-600">30-day return policy</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CircleHelp className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Support</h4>
                          <p className="text-sm text-gray-600">24/7 customer service</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Check Delivery */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2">Check Delivery</h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter PIN code" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        maxLength={6}
                      />
                      <Button variant="outline">Check</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Product Tabs */}
              <div className="mt-16">
                <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full border-b rounded-none justify-start mb-6">
                    <TabsTrigger value="description" className="rounded-none">Description</TabsTrigger>
                    <TabsTrigger value="specifications" className="rounded-none">Specifications</TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-none">Reviews ({product.reviewCount})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="py-4">
                    <div dangerouslySetInnerHTML={{ __html: product.longDescription || product.description }} />
                  </TabsContent>
                  
                  <TabsContent value="specifications" className="py-4">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 pr-4 text-gray-600 font-medium w-1/4">Brand</td>
                          <td className="py-3">{product.brand || 'N/A'}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 text-gray-600 font-medium">Category</td>
                          <td className="py-3">{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 text-gray-600 font-medium">Stock</td>
                          <td className="py-3">{product.stock} items</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 text-gray-600 font-medium">Weight</td>
                          <td className="py-3">0.5 kg (approx)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 text-gray-600 font-medium">Dimensions</td>
                          <td className="py-3">25 x 15 x 5 cm (approx)</td>
                        </tr>
                      </tbody>
                    </table>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="py-4">
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/3">
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-3">Customer Reviews</h3>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-4xl font-bold">{product.rating.toFixed(1)}</div>
                              <div>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`h-5 w-5 ${
                                        index < Math.floor(product.rating)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-gray-500">{product.reviewCount} reviews</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {Array.from({ length: 5 }).map((_, index) => {
                                const rating = 5 - index;
                                // Random percentage for demo
                                const percentage = Math.floor(Math.random() * 100);
                                return (
                                  <div key={rating} className="flex items-center gap-2">
                                    <span className="text-sm font-medium w-10">{rating} star</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-yellow-400"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-500">{percentage}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-2/3">
                          <h3 className="text-xl font-bold mb-4">Top Reviews</h3>
                          
                          <div className="space-y-6">
                            {/* Sample reviews - would be fetched from API in production */}
                            <div className="border-b pb-6">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">John D.</h4>
                                <span className="text-sm text-gray-500">2 weeks ago</span>
                              </div>
                              <div className="flex mb-2">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    className={`h-4 w-4 ${
                                      index < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-700">
                                Great product! My dog absolutely loves it. The quality is excellent and it has lasted much longer than similar products I've bought before.
                              </p>
                            </div>
                            
                            <div className="border-b pb-6">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Sarah P.</h4>
                                <span className="text-sm text-gray-500">1 month ago</span>
                              </div>
                              <div className="flex mb-2">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    className={`h-4 w-4 ${
                                      index < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-700">
                                Very satisfied with this purchase. Shipping was quick and the product looks exactly like the pictures. Would recommend!
                              </p>
                            </div>
                            
                            <Button variant="outline">See All Reviews</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Similar Products */}
              {similarProducts && similarProducts.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold mb-6">You may also like</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isSimilarLoading ? (
                      <div className="col-span-full flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      similarProducts.map((similarProduct: any) => (
                        <div key={similarProduct.id} className="group bg-white rounded-lg border overflow-hidden">
                          <Link href={`/products/${similarProduct.slug}`} className="block">
                            <img 
                              src={similarProduct.images[0]} 
                              alt={similarProduct.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="font-medium mb-1">{similarProduct.name}</h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold">₹{(similarProduct.price / 100).toFixed(2)}</span>
                                {similarProduct.originalPrice && (
                                  <span className="text-gray-500 text-sm line-through">
                                    ₹{(similarProduct.originalPrice / 100).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    className={`h-3 w-3 ${
                                      index < Math.floor(similarProduct.rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  return {
    props: {
      slug,
    },
  };
};