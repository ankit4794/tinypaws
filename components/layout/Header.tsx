import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Heart, 
  User,
  Menu,
  X,
  Search,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
      }
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            TinyPaws
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={`text-gray-800 hover:text-black ${router.pathname === '/' ? 'font-medium' : ''}`}>
              Home
            </Link>
            <Link href="/products" className={`text-gray-800 hover:text-black ${router.pathname === '/products' ? 'font-medium' : ''}`}>
              Products
            </Link>
            <Link href="/categories" className={`text-gray-800 hover:text-black ${router.pathname === '/categories' ? 'font-medium' : ''}`}>
              Categories
            </Link>
            <Link href="/contact" className={`text-gray-800 hover:text-black ${router.pathname === '/contact' ? 'font-medium' : ''}`}>
              Contact
            </Link>
          </nav>

          {/* Icons and User */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.fullName || user.username}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/auth">
                  Login / Register
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Products
            </Link>
            <Link 
              href="/categories" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Categories
            </Link>
            <Link 
              href="/contact" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div className="ml-3">
                {user ? (
                  <div className="text-base font-medium text-gray-800">
                    {user.fullName || user.username}
                  </div>
                ) : (
                  <Link 
                    href="/auth" 
                    className="text-base font-medium text-gray-800 hover:text-black"
                    onClick={toggleMenu}
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
            {user && (
              <div className="mt-3 px-2 space-y-1">
                <Link 
                  href="/profile" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  My Profile
                </Link>
                <Link 
                  href="/orders" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  My Orders
                </Link>
                <Link 
                  href="/wishlist" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  My Wishlist
                </Link>
                <Link 
                  href="/cart" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  My Cart
                </Link>
                {user.role === 'ADMIN' && (
                  <Link 
                    href="/admin" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                    onClick={toggleMenu}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}