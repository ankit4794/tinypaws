import { ReactNode, useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  Package, 
  ListOrdered, 
  Users, 
  ShoppingBag, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ShoppingCart,
  Tag,
  Map,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Products', href: '/admin/products', icon: <Package className="h-5 w-5" /> },
    { name: 'Brands', href: '/admin/brands', icon: <Award className="h-5 w-5" /> },
    { name: 'Categories', href: '/admin/categories', icon: <Tag className="h-5 w-5" /> },
    { name: 'Orders', href: '/admin/orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Customers', href: '/admin/customers', icon: <Users className="h-5 w-5" /> },
    { name: 'Pincode Management', href: '/admin/pincodes', icon: <Map className="h-5 w-5" /> },
    { name: 'CMS Pages', href: '/admin/cms', icon: <FileText className="h-5 w-5" /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r">
        <div className="h-16 border-b flex items-center px-6">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">TinyPaws Admin</span>
            </a>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center px-2 py-2 rounded-md ${
                  location === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </a>
            </Link>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start px-2 py-2 text-red-500 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </nav>
        {user && (
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {user.fullName ? user.fullName[0].toUpperCase() : user.username[0].toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center px-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="h-16 border-b flex items-center px-6">
                <Link href="/" onClick={closeMobileMenu}>
                  <a className="flex items-center space-x-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">TinyPaws Admin</span>
                  </a>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4"
                  onClick={closeMobileMenu}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
                    <a
                      className={`flex items-center px-2 py-2 rounded-md ${
                        location === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </a>
                  </Link>
                ))}
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-2 py-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </nav>
              {user && (
                <div className="border-t p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                        {user.fullName ? user.fullName[0].toUpperCase() : user.username[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">TinyPaws Admin</span>
              </a>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}