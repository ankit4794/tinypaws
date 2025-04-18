import { useEffect } from 'react';
import Head from 'next/head';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Import components as needed for the homepage
export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  
  // Fetch featured products
  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products?limit=4');
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      return res.json();
    }
  });

  return (
    <>
      <Head>
        <title>TinyPaws - Premium Pet Supplies</title>
        <meta name="description" content="TinyPaws - Your one-stop shop for premium pet products" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="bg-white py-12 md:py-20">
            <div className="container px-4 mx-auto">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-10 md:mb-0">
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                    Premium Products for Your Furry Friends
                  </h1>
                  <p className="text-lg mb-6">
                    Discover high-quality food, accessories, and toys for your pets.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="/products" className="inline-block bg-black text-white py-3 px-6 rounded-md font-medium">
                      Shop Now
                    </a>
                    <a href="/categories" className="inline-block bg-gray-100 text-black py-3 px-6 rounded-md font-medium">
                      Browse Categories
                    </a>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80" 
                    alt="Happy dog" 
                    className="rounded-lg shadow-xl w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="py-12 bg-gray-50">
            <div className="container px-4 mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Featured Products</h2>
              
              {productsLoading ? (
                <div className="text-center">Loading products...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {featuredProducts?.map((product: any) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <span className="font-bold">₹{(product.price / 100).toFixed(2)}</span>
                            {product.originalPrice && (
                              <span className="text-gray-400 line-through ml-2">
                                ₹{(product.originalPrice / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <a href={`/products/${product.slug}`} className="text-black font-medium">
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Categories Section */}
          <section className="py-12">
            <div className="container px-4 mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Shop by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/products?category=dogs" className="group relative rounded-lg overflow-hidden shadow-lg h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80"
                    alt="Dogs" 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-bold">Dogs</h3>
                  </div>
                </a>
                <a href="/products?category=cats" className="group relative rounded-lg overflow-hidden shadow-lg h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2043&q=80"
                    alt="Cats" 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-bold">Cats</h3>
                  </div>
                </a>
                <a href="/products?category=small-animals" className="group relative rounded-lg overflow-hidden shadow-lg h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1591561582301-7ce6587cc286?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                    alt="Small Animals" 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-bold">Small Animals</h3>
                  </div>
                </a>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="py-12 bg-gray-50">
            <div className="container px-4 mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Why Choose TinyPaws?</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-black rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                  <p className="text-gray-600">We source only the highest quality products for your pets.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-black rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                  <p className="text-gray-600">Quick delivery to your doorstep across India.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-black rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                  <p className="text-gray-600">Multiple secure payment options available.</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-black rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                  <p className="text-gray-600">Our customer service team is always ready to help.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}