import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X,
  ChevronDown,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const router = useRouter();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
      }
    });
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>+91 1234567890</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Delhi, India</span>
            </div>
          </div>
          <div className="space-x-4">
            <Link href="/contact" className="hover:text-black">Contact</Link>
            <Link href="/about" className="hover:text-black">About Us</Link>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl">
            Tiny<span className="text-black">Paws</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`hover:text-black transition-colors ${router.pathname === '/' ? 'font-medium' : ''}`}
            >
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-black transition-colors">
                Categories
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute z-10 left-0 top-full bg-white shadow-lg rounded-md py-2 w-48 hidden group-hover:block">
                <Link 
                  href="/products?category=dogs" 
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Dogs
                </Link>
                <Link 
                  href="/products?category=cats" 
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Cats
                </Link>
                <Link 
                  href="/products?category=small-animals" 
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Small Animals
                </Link>
                <Link 
                  href="/products" 
                  className="block px-4 py-2 hover:bg-gray-100 font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <Link 
              href="/products" 
              className={`hover:text-black transition-colors ${router.pathname.startsWith('/products') ? 'font-medium' : ''}`}
            >
              All Products
            </Link>
            <Link 
              href="/offers" 
              className={`hover:text-black transition-colors ${router.pathname === '/offers' ? 'font-medium' : ''}`}
            >
              Offers
            </Link>
          </nav>
          
          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            
            <Link 
              href="/wishlist"
              className="p-2 rounded-full hover:bg-gray-100 relative"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            
            <Link 
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100 relative"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            
            {user ? (
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-1">
                  <User className="h-5 w-5" />
                  <span className="hidden lg:inline text-sm">{user.username}</span>
                  <ChevronDown className="h-4 w-4 hidden lg:inline" />
                </button>
                <div className="absolute z-10 right-0 top-full bg-white shadow-lg rounded-md py-2 w-48 hidden group-hover:block">
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/orders" 
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Login / Register
                </Button>
              </Link>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Overlay */}
      {searchOpen && (
        <div className="container mx-auto px-4 py-4 border-t">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for products..."
              className="flex-grow"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <Button type="submit">Search</Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setSearchOpen(false)}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between border-b">
            <h2 className="font-bold text-xl">Menu</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-grow overflow-auto">
            <nav className="container mx-auto px-4 py-6 space-y-6">
              <Link 
                href="/"
                className="block text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              <div>
                <h3 className="text-lg mb-2 font-medium">Categories</h3>
                <div className="space-y-2 pl-4">
                  <Link 
                    href="/products?category=dogs" 
                    className="block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dogs
                  </Link>
                  <Link 
                    href="/products?category=cats" 
                    className="block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cats
                  </Link>
                  <Link 
                    href="/products?category=small-animals" 
                    className="block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Small Animals
                  </Link>
                  <Link 
                    href="/products" 
                    className="block font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View All
                  </Link>
                </div>
              </div>
              
              <Link 
                href="/products"
                className="block text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
              </Link>
              
              <Link 
                href="/offers"
                className="block text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Offers
              </Link>
              
              <Link 
                href="/wishlist"
                className="block text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
              
              <Link 
                href="/cart"
                className="block text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cart
              </Link>
              
              <div className="pt-4 border-t">
                {user ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Logged in as:</p>
                      <p className="font-medium">{user.username}</p>
                    </div>
                    <div className="space-y-2">
                      <Link 
                        href="/profile" 
                        className="block"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link 
                        href="/orders" 
                        className="block"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button 
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="block text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      href="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full">Login / Register</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}