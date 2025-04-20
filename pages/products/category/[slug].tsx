import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Loader2, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import ProductCard from '@/components/ui/ProductCard';
import QuickViewModal from '@/components/ui/QuickViewModal';
import { Product } from '@shared/schema';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';

const CategoryProductsPage = () => {
  const router = useRouter();
  const { slug, subcategory = '', brand = '', sortOrder = 'newest' } = router.query;
  const category = slug; // For backward compatibility
  
  const [filters, setFilters] = useState({
    priceRange: [0, 10000] as [number, number],
    filterBrands: [] as string[],
    inStock: false,
    onSale: false,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currentSort, setCurrentSort] = useState(sortOrder as string);
  
  // Fetch products using our custom hook
  const { data: products, isLoading, error } = useProducts({
    category: category as string,
    subcategory: subcategory as string,
    sort: currentSort,
  });
  
  // Fetch categories using our custom hook
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  
  // Find current category
  const currentCategory = categories?.find(c => c.slug === category);
  
  // Get subcategories for current category
  const subcategories = categories?.filter(c => c.parentId === currentCategory?._id);
  
  // Get breadcrumb path
  const getBreadcrumbPath = () => {
    const path = [{ name: 'Home', href: '/' }];
    
    if (currentCategory) {
      path.push({
        name: currentCategory.name,
        href: `/products/${currentCategory.slug}`,
      });
    }
    
    if (subcategory) {
      const sub = categories?.find(c => c.slug === subcategory);
      if (sub) {
        path.push({
          name: sub.name,
          href: `/products/${category}/${subcategory}`,
        });
      }
    }
    
    return path;
  };
  
  const handleSortChange = (sort: string) => {
    setCurrentSort(sort);
    
    // Update URL with new sort parameter
    router.push({
      pathname: router.pathname,
      query: { ...router.query, sortOrder: sort },
    }, undefined, { shallow: true });
  };
  
  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };
  
  const handlePriceRangeChange = (value: [number, number]) => {
    setFilters({ ...filters, priceRange: value });
  };
  
  const toggleBrandFilter = (brand: string) => {
    const newBrands = filters.filterBrands.includes(brand)
      ? filters.filterBrands.filter(b => b !== brand)
      : [...filters.filterBrands, brand];
    
    setFilters({ ...filters, filterBrands: newBrands });
  };
  
  // Filter products based on selected filters
  const filteredProducts = products?.filter(product => {
    // Price filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    // Brand filter
    if (filters.filterBrands.length > 0 && !filters.filterBrands.includes(product.brand || '')) {
      return false;
    }
    
    // Stock filter
    if (filters.inStock && product.stock <= 0) {
      return false;
    }
    
    // Sale filter
    if (filters.onSale && (!product.originalPrice || product.originalPrice <= product.price)) {
      return false;
    }
    
    return true;
  });
  
  // Available brands for filtering
  const availableBrands = [...new Set(products?.map(p => p.brand).filter(Boolean) || [])];
  
  // Page title
  const pageTitle = subcategory
    ? `${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} Products | TinyPaws`
    : `${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All'} Products | TinyPaws`;
  
  if (isLoading || isCategoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Products</h2>
        <p className="text-gray-600">
          There was an error loading the products. Please try again later.
        </p>
      </div>
    );
  }
  
  const breadcrumbPath = getBreadcrumbPath();
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta 
          name="description" 
          content={`Shop our collection of ${
            subcategory || category || 'pet'
          } products for your furry friend at TinyPaws`} 
        />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex text-sm text-gray-500 mb-6">
          {breadcrumbPath.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {index === breadcrumbPath.length - 1 ? (
                <span className="text-black">{item.name}</span>
              ) : (
                <a href={item.href} className="hover:text-black">
                  {item.name}
                </a>
              )}
            </div>
          ))}
        </div>
        
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {currentCategory?.name || 'All Products'}
          </h1>
          {currentCategory?.description && (
            <p className="text-gray-600">{currentCategory.description}</p>
          )}
        </div>
        
        {/* Subcategories */}
        {subcategories && subcategories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {subcategories.map((subcat) => (
              <a
                key={subcat._id}
                href={`/products/${category}/${subcat.slug}`}
                className="bg-gray-100 hover:bg-gray-200 text-center p-4 rounded-md transition"
              >
                {subcat.image && (
                  <img 
                    src={subcat.image} 
                    alt={subcat.name} 
                    className="w-16 h-16 mx-auto mb-2 object-contain"
                  />
                )}
                <h3 className="font-medium text-sm">{subcat.name}</h3>
              </a>
            ))}
          </div>
        )}
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            className="w-full flex justify-between items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter & Sort
            </span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Mobile (Conditional) & Desktop */}
          <div
            className={`
              ${showFilters ? 'block' : 'hidden'} lg:block 
              w-full lg:w-1/4 xl:w-1/5
            `}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
              <h2 className="font-bold text-lg mb-4">Filters</h2>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider 
                    defaultValue={[0, 10000]} 
                    max={10000} 
                    step={100}
                    value={filters.priceRange}
                    onValueChange={handlePriceRangeChange}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
              </div>
              
              {/* Brands */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Brands</h3>
                  <div className="space-y-2">
                    {availableBrands.map((brand) => (
                      <div className="flex items-center" key={brand}>
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={filters.filterBrands.includes(brand)}
                          onCheckedChange={() => toggleBrandFilter(brand)}
                        />
                        <label
                          htmlFor={`brand-${brand}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Availability */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="in-stock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) => setFilters({ ...filters, inStock: !!checked })}
                    />
                    <label
                      htmlFor="in-stock"
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      In Stock
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="on-sale"
                      checked={filters.onSale}
                      onCheckedChange={(checked) => setFilters({ ...filters, onSale: !!checked })}
                    />
                    <label
                      htmlFor="on-sale"
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      On Sale
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Clear Filters */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilters({
                  priceRange: [0, 10000],
                  filterBrands: [],
                  inStock: false,
                  onSale: false,
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
          
          {/* Products */}
          <div className="w-full lg:w-3/4 xl:w-4/5">
            {/* Sort & Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <p className="text-gray-600 mb-2 sm:mb-0">
                Showing {filteredProducts?.length || 0} results
              </p>
              
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Sort by:</span>
                <select
                  className="border border-gray-300 rounded-md p-1.5"
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="popular">Popularity</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
            
            {/* Products Grid */}
            {filteredProducts?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-md">
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or check back later for new products.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setFilters({
                    priceRange: [0, 10000],
                    filterBrands: [],
                    inStock: false,
                    onSale: false,
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts?.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onQuickView={() => handleQuickView(product)}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination - For future implementation */}
            {filteredProducts && filteredProducts.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  disabled={true}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-black text-white border-black"
                >
                  1
                </Button>
                <Button 
                  variant="outline" 
                  className="ml-2"
                  disabled={true}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
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

export default CategoryProductsPage;