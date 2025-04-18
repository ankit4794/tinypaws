import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  ShoppingCart, 
  Heart, 
  Star, 
  TruckIcon,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function HomePage() {
  const [featuredTab, setFeaturedTab] = useState('new-arrivals');
  
  // Fetch featured products
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['/api/products/featured', featuredTab],
    queryFn: async () => {
      const res = await fetch(`/api/products/featured?type=${featuredTab}`);
      if (!res.ok) throw new Error('Failed to fetch featured products');
      return res.json();
    },
  });
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  return (
    <>
      <Head>
        <title>TinyPaws - Premium Pet Products for Your Beloved Companions</title>
        <meta 
          name="description" 
          content="TinyPaws offers premium quality pet products for dogs, cats, and small animals. Shop food, toys, grooming supplies, and more for your beloved pet companions." 
        />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative bg-gray-100">
            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Premium Pet Products for Your Beloved Companions
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Discover a world of quality products for your furry, feathery, or scaly friends.
                    From nutrition to fun, we've got everything your pet needs.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" asChild>
                      <Link href="/products">
                        Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/products?category=deals">
                        View Deals
                      </Link>
                    </Button>
                  </div>
                </div>
                <div>
                  <img 
                    src="/hero-image.jpg" 
                    alt="Happy pets with TinyPaws products" 
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Categories Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Shop by Pet</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Dog Category */}
                <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg">
                  <Link href="/products?category=dogs" className="block">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src="/dog-category.jpg"
                        alt="Dog Products"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Dogs</h3>
                        <p className="text-white/90 mb-4">
                          Food, toys, accessories, and more for your loyal companions
                        </p>
                        <span className="inline-flex items-center text-white text-sm font-medium">
                          Shop Now <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                
                {/* Cat Category */}
                <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg">
                  <Link href="/products?category=cats" className="block">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src="/cat-category.jpg"
                        alt="Cat Products"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Cats</h3>
                        <p className="text-white/90 mb-4">
                          Everything your feline friends need for a happy life
                        </p>
                        <span className="inline-flex items-center text-white text-sm font-medium">
                          Shop Now <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                
                {/* Small Animals Category */}
                <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg">
                  <Link href="/products?category=small-animals" className="block">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src="/small-animals-category.jpg"
                        alt="Small Animals Products"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Small Animals</h3>
                        <p className="text-white/90 mb-4">
                          Supplies for rabbits, hamsters, guinea pigs and more
                        </p>
                        <span className="inline-flex items-center text-white text-sm font-medium">
                          Shop Now <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          
          {/* Featured Products */}
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-4">Featured Products</h2>
              <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Discover our selection of premium pet products, specially curated for quality and value
              </p>
              
              <Tabs value={featuredTab} onValueChange={setFeaturedTab} className="mb-12">
                <TabsList className="mx-auto">
                  <TabsTrigger value="new-arrivals">New Arrivals</TabsTrigger>
                  <TabsTrigger value="best-sellers">Best Sellers</TabsTrigger>
                  <TabsTrigger value="deals">Special Deals</TabsTrigger>
                </TabsList>
                
                {['new-arrivals', 'best-sellers', 'deals'].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-8">
                    {isLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : featuredProducts && featuredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product: any) => (
                          <div key={product.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <Link href={`/products/${product.slug}`} className="block relative">
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {product.originalPrice && (
                                <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                </span>
                              )}
                            </Link>
                            <div className="p-4">
                              <Link href={`/products/${product.slug}`} className="block">
                                <h3 className="font-medium mb-1 group-hover:text-black transition-colors">
                                  {product.name}
                                </h3>
                                <div className="flex items-center mb-2">
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(product.rating || 0)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({product.reviewCount || 0})
                                  </span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-3">
                                  <span className="font-bold">₹{(product.price / 100).toFixed(2)}</span>
                                  {product.originalPrice && (
                                    <span className="text-gray-500 text-sm line-through">
                                      ₹{(product.originalPrice / 100).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </Link>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 flex items-center justify-center gap-1"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  Add
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center justify-center"
                                >
                                  <Heart className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No products found.</p>
                      </div>
                    )}
                    
                    <div className="text-center mt-8">
                      <Button variant="outline" asChild>
                        <Link href={`/products?type=${tab}`}>
                          View All {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Link>
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </section>
          
          {/* Benefits Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                    <TruckIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
                  <p className="text-gray-600">
                    On all orders above ₹999
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Quality Guarantee</h3>
                  <p className="text-gray-600">
                    Premium products for your pets
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                    <RotateCcw className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
                  <p className="text-gray-600">
                    30-day return policy
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Testimonials Section */}
          <section className="bg-gray-100 py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">
                    "I've been shopping with TinyPaws for over a year now, and I'm always impressed with the quality of their products. My dog loves the treats, and the delivery is always prompt."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-4">
                      <img 
                        src="/testimonial-1.jpg" 
                        alt="Customer" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">Priya Sharma</h4>
                      <p className="text-sm text-gray-500">Dog Parent</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">
                    "The variety of cat toys available at TinyPaws is amazing! My feline friend is quite picky, but she loves everything I've bought from here. Great customer service too!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-4">
                      <img 
                        src="/testimonial-2.jpg" 
                        alt="Customer" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">Rohit Mehta</h4>
                      <p className="text-sm text-gray-500">Cat Parent</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">
                    "I appreciate that TinyPaws offers special products for small animals. Finding quality supplies for my guinea pigs used to be challenging, but not anymore!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-4">
                      <img 
                        src="/testimonial-3.jpg" 
                        alt="Customer" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">Anjali Patel</h4>
                      <p className="text-sm text-gray-500">Guinea Pig Parent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Newsletter Section */}
          <section className="bg-black text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Join the TinyPaws Family</h2>
                <p className="mb-8">
                  Subscribe to our newsletter for pet care tips, exclusive offers, and new product updates.
                </p>
                
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input 
                    type="email"
                    placeholder="Your email address"
                    className="px-4 py-3 rounded-md flex-grow bg-white/10 text-white placeholder:text-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <Button>Subscribe</Button>
                </form>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}