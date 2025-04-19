import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { logoutMutation } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/admin/products', label: 'Products', icon: <Package className="h-5 w-5" /> },
    { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { href: '/admin/customers', label: 'Customers', icon: <Users className="h-5 w-5" /> },
    { href: '/admin/cms', label: 'CMS Pages', icon: <FileText className="h-5 w-5" /> },
    { href: '/admin/contact', label: 'Contact Messages', icon: <MessageSquare className="h-5 w-5" /> },
    { href: '/admin/newsletter', label: 'Newsletter', icon: <Mail className="h-5 w-5" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navbar */}
      <header className="bg-white shadow-sm z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 lg:hidden hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="font-bold text-xl">
                  TinyPaws Admin
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar for desktop */}
        <aside
          className={`bg-white shadow-md fixed inset-y-16 left-0 z-20 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:relative lg:inset-y-0 w-64 overflow-y-auto`}
        >
          <div className="px-4 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Admin Menu</h2>
              <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-5 space-y-1">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile menu, show/hide based on menu state */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="px-4 pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold">TinyPaws Admin</h1>
                  </div>
                  <button
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <nav className="mt-5 space-y-1">
                  {navItems.map((item) => {
                    const isActive = router.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={toggleMobileMenu}
                      >
                        <span className={`mr-3 ${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className={`flex-1 overflow-auto p-4 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;