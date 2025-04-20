import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCategories } from "@/hooks/use-categories";
import LoginModal from "@/components/ui/LoginModal";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { cartItems } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pincode, setPincode] = useState("110001");
  const { parentCategories, isLoading: categoriesLoading } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
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
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition"
            >
              Login/Sign Up
            </button>
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
                    <Link href={`/products/${category.slug}`} className="flex items-center">
                      {category.name}
                      {category.subCategories && category.subCategories.length > 0 && (
                        <i className="fas fa-chevron-down ml-1 text-xs"></i>
                      )}
                    </Link>
                    {/* Dropdown for subcategories */}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <div className="absolute hidden group-hover:block z-50 mt-4 w-48 bg-white border border-gray-200 shadow-lg">
                        <ul>
                          {category.subCategories.map((sub) => (
                            <li key={sub._id}>
                              <Link 
                                href={`/products/${sub.slug}`} 
                                className="block px-4 py-2 hover:bg-gray-100"
                              >
                                {sub.name}
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

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </header>
  );
};

export default Header;
