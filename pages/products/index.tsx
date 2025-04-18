import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, SlidersHorizontal, Heart, ShoppingCart } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const { category, subcategory, sort } = router.query;
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products with filters
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/products', category, subcategory, sort],
    queryFn: async () => {
      let url = '/api/products?';
      if (category) url += `category=${category}&`;
      if (subcategory) url += `subcategory=${subcategory}&`;
      if (sort) url += `sort=${sort}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Would normally navigate to search results page
    console.log('Searching for:', searchQuery);
  };

  // Filter products based on search query
  const filteredProducts = searchQuery.trim() === ''
    ? products 
    : products?.filter((product: any) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <>
      <Head>
        <title>
          {category 
            ? `${(category as string).charAt(0).toUpperCase() + (category as string).slice(1)} Products` 
            : 'All Products'} | TinyPaws
        </title>
        <meta name="description" content="Browse our selection of premium pet products" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {/* Page Header */}
          <div className="bg-gray-50 py-8">
            <div className="container px-4 mx-auto">
              <h1 className="text-3xl font-bold mb-2">
                {category 
                  ? `${(category as string).charAt(0).toUpperCase() + (category as string).slice(1)} Products` 
                  : 'All Products'}
              </h1>
              <nav className="text-sm breadcrumbs">
                <ul className="flex gap-2">
                  <li><Link href="/" className="text-gray-500 hover:text-black">Home</Link></li>
                  <li className="before:content-['/'] before:mx-2 before:text-gray-400">
                    <Link href="/products" className="text-gray-500 hover:text-black">Products</Link>
                  </li>
                  {category && (
                    <li className="before:content-['/'] before:mx-2 before:text-gray-400">
                      <span className="text-black">{(category as string).charAt(0).toUpperCase() + (category as string).slice(1)}</span>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Search & Filters */}
          <div className="border-b">
            <div className="container px-4 mx-auto py-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearch} className="w-full md:w-auto flex gap-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      type="text" 
                      placeholder="Search products..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                  
                  <select 
                    className="border rounded-md px-3 py-2 bg-background"
                    onChange={(e) => {
                      const value = e.target.value;
                      router.push({
                        pathname: router.pathname,
                        query: {
                          ...router.query,
                          sort: value,
                        },
                      });
                    }}
                    value={sort as string || 'default'}
                  >
                    <option value="default">Default sorting</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest first</option>
                    <option value="rating">By rating</option>
                  </select>
                </div>
              </div>
              
              {/* Filter panels */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pt-4 border-t">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Categories</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/products?category=dogs" className={`hover:text-black ${category === 'dogs' ? 'font-medium text-black' : 'text-gray-600'}`}>
                          Dogs
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=cats" className={`hover:text-black ${category === 'cats' ? 'font-medium text-black' : 'text-gray-600'}`}>
                          Cats
                        </Link>
                      </li>
                      <li>
                        <Link href="/products?category=small-animals" className={`hover:text-black ${category === 'small-animals' ? 'font-medium text-black' : 'text-gray-600'}`}>
                          Small Animals
                        </Link>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Price Range</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="price-1" className="mr-2" />
                        <label htmlFor="price-1" className="text-gray-600">Under ₹500</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="price-2" className="mr-2" />
                        <label htmlFor="price-2" className="text-gray-600">₹500 - ₹1000</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="price-3" className="mr-2" />
                        <label htmlFor="price-3" className="text-gray-600">₹1000 - ₹2000</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="price-4" className="mr-2" />
                        <label htmlFor="price-4" className="text-gray-600">₹2000+</label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Brands</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="brand-1" className="mr-2" />
                        <label htmlFor="brand-1" className="text-gray-600">Royal Canin</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="brand-2" className="mr-2" />
                        <label htmlFor="brand-2" className="text-gray-600">PetZilla</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="brand-3" className="mr-2" />
                        <label htmlFor="brand-3" className="text-gray-600">Kong</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="brand-4" className="mr-2" />
                        <label htmlFor="brand-4" className="text-gray-600">Pedigree</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Products Grid */}
          <section className="py-12">
            <div className="container px-4 mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Failed to load products. Please try again.</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.reload()}>
                    Refresh
                  </Button>
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProducts.map((product: any) => (
                    <div key={product.id} className="group bg-white rounded-lg border overflow-hidden transition-all hover:shadow-md">
                      <Link href={`/products/${product.slug}`} className="block relative">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 right-2 bg-black text-white text-xs font-medium px-2 py-1 rounded">
                          {product.originalPrice && (
                            `${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`
                          )}
                        </span>
                      </Link>
                      <div className="p-4">
                        <Link href={`/products/${product.slug}`} className="block">
                          <h3 className="font-medium text-lg mb-1 group-hover:text-black transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="font-bold text-lg">₹{(product.price / 100).toFixed(2)}</span>
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
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found. Try adjusting your filters.</p>
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