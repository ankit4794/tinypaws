import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  path: string;
  subcategories: Category[];
}

const Header = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pincode, setPincode] = useState("110001");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setParentCategories(data.filter((cat: Category) => !cat.parentId));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch cart items on component mount
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          setCartItems(data);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCartItems();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="w-full">
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        Food's Low? Time to Restock!
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold flex items-center">
              <span className="text-black mr-1">tiny</span>
              <span className="text-black font-bold">paws</span>
              <i className="fas fa-paw ml-1 text-black"></i>
            </div>
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search For Dog Food"
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
            >
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
        
        {/* Account & Cart */}
        <div className="flex items-center space-x-6">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/account" className="hover:text-gray-700">
                <span className="hidden md:inline">Hello, </span>
                {user.fullName || user.email || user.mobile || "User"}
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth" className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition">
              Login/Sign Up
            </Link>
          )}
          
          <Link href="/cart" className="relative">
            <i className="fas fa-shopping-cart text-xl"></i>
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          </Link>
          
          <div className="hidden md:flex items-center">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span>{pincode}</span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="border-t border-b border-gray-200">
        <div className="container mx-auto">
          {categoriesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-black" />
            </div>
          ) : (
            <ul className="flex flex-wrap justify-center md:justify-start space-x-0 md:space-x-8">
              {parentCategories && parentCategories.length > 0 ? (
                // Render dynamic categories from database
                parentCategories.map((category) => (
                  <li key={category._id} className="group relative py-4 px-2 hover:text-orange-500">
                    <Link href={category.path}>
                      <span className="flex items-center">
                        {category.name}
                        {category.subcategories.length > 0 && (
                          <i className="fas fa-chevron-down ml-1 text-xs"></i>
                        )}
                      </span>
                    </Link>
                    {/* Dropdown for subcategories */}
                    {category.subcategories.length > 0 && (
                      <div className="absolute hidden group-hover:block z-50 mt-4 w-48 bg-white border border-gray-200 shadow-lg">
                        <ul>
                          {category.subcategories.map((sub) => (
                            <li key={sub._id}>
                              <Link href={sub.path}>
                                <span className="block px-4 py-2 hover:bg-gray-100">
                                  {sub.name}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                // Fallback - display fixed menu items if no categories found
                <>
                  <li className="py-4 px-2 hover:text-orange-500">
                    <Link href="/products">All Products</Link>
                  </li>
                </>
              )}
              
              {/* Fixed menu items that are always displayed */}
              <li className="py-4 px-2 hover:text-orange-500">
                <Link href="/store-locator">Store Locator</Link>
              </li>
              
              <li className="py-4 px-2 hover:text-orange-500">
                <Link href="/fresh-meals">Fresh Meals</Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;