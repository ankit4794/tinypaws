import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Product } from "@shared/schema";
import ProductCard from "@/components/ui/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // Assuming these components exist
import { useProducts } from "@/hooks/use-products";


const ProductsPage = () => {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [pincode, setPincode] = useState(''); // Add pincode state
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]); // Add selected filters state

  // Use our custom hook with caching
  const { data, isLoading, error } = useProducts({
    category,
    subcategory,
    sort: sortBy
  });

  useEffect(() => {
    if (data) {
      let filteredProducts = [...data];

      // Apply price filter
      filteredProducts = filteredProducts.filter(
        product => product.price >= priceRange[0] && product.price <= priceRange[1]
      );

      // Apply rating filter
      if (selectedRatings.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          selectedRatings.includes(Math.floor(product.rating))
        );
      }

      // Apply brand filter
      if (selectedBrands.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          product.brand && selectedBrands.includes(product.brand)
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "price-asc":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          filteredProducts.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        // Default is "featured", no sorting needed
      }

      setProducts(filteredProducts);
    }
  }, [data, sortBy, priceRange, selectedRatings, selectedBrands, pincode]);

  const handleRatingChange = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedRatings([]);
    setSelectedBrands([]);
    setPincode('');
    setSelectedFilters([]);
  };

  // Sample brands - in a real app, this would come from the API
  const brands = ["Royal Canin", "Pedigree", "Whiskas", "Kong", "PetZilla", "Himalaya"];

  const categoryTitle = subcategory
    ? `${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} for ${category.charAt(0).toUpperCase() + category.slice(1)}`
    : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold mb-4">{categoryTitle}</h1>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="max-w-[200px]"
              />
              <Button variant="outline" onClick={() => {/* Add pincode check logic here */}}>Check</Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span>Active Filters:</span>
            {selectedFilters.map(filter => (
              <Badge key={filter} variant="secondary" className="cursor-pointer" onClick={() => {
                setSelectedFilters(selectedFilters.filter(f => f !== filter));
                // Update filters based on removed filter
              }}>
                {filter} ×
              </Badge>
            ))}
            {selectedFilters.length > 0 && (
              <Button variant="link" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-8">
            <Accordion type="multiple" className="space-y-4">
              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4 px-2">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={5000}
                      step={100}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rating">
                <AccordionTrigger>Rating</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={selectedRatings.includes(rating)}
                          onCheckedChange={() => handleRatingChange(rating)}
                        />
                        <Label htmlFor={`rating-${rating}`} className="ml-2 flex items-center">
                          {Array.from({ length: rating }).map((_, i) => (
                            <i key={i} className="fas fa-star text-yellow-400 text-sm"></i>
                          ))}
                          {Array.from({ length: 5 - rating }).map((_, i) => (
                            <i key={i} className="far fa-star text-yellow-400 text-sm"></i>
                          ))}
                          <span className="ml-1">& Up</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brand">
                <AccordionTrigger>Brand</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandChange(brand)}
                        />
                        <Label htmlFor={`brand-${brand}`} className="ml-2">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full md:w-3/4">

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Failed to load products. Please try again.
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <i className="fas fa-search text-3xl text-gray-400 mb-2"></i>
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-gray-500 mt-1">Try changing your filters or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;