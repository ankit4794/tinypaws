import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingBasket,
  UsersRound,
  Tag,
  ClipboardList,
  FileText,
  MessageSquare,
  Mail,
  HelpCircle,
  Star,
  Settings,
  Menu,
  X,
  PanelLeft,
  ShoppingBag,
  BarChart4,
  GalleryVerticalEnd,
  BadgePercent
} from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: 'Orders', href: '/admin/orders', icon: <ShoppingBasket className="h-5 w-5" /> },
  { title: 'Customers', href: '/admin/customers', icon: <UsersRound className="h-5 w-5" /> },
  { title: 'Products', href: '/admin/products', icon: <ShoppingBag className="h-5 w-5" /> },
  { title: 'Categories', href: '/admin/categories', icon: <GalleryVerticalEnd className="h-5 w-5" /> },
  { title: 'Brands', href: '/admin/brands', icon: <Tag className="h-5 w-5" /> },
  { title: 'Promotions', href: '/admin/promotions', icon: <BadgePercent className="h-5 w-5" /> },
  { title: 'Reports', href: '/admin/reports', icon: <BarChart4 className="h-5 w-5" /> },
  { title: 'Helpdesk', href: '/admin/helpdesk', icon: <HelpCircle className="h-5 w-5" /> },
  { title: 'Reviews', href: '/admin/reviews', icon: <Star className="h-5 w-5" /> },
  { title: 'CMS Pages', href: '/admin/cms', icon: <FileText className="h-5 w-5" /> },
  { title: 'Contact Messages', href: '/admin/contact-messages', icon: <MessageSquare className="h-5 w-5" /> },
  { title: 'Newsletter', href: '/admin/newsletter', icon: <Mail className="h-5 w-5" /> },
  { title: 'Disclaimers', href: '/admin/disclaimers', icon: <ClipboardList className="h-5 w-5" /> },
  { title: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
];

const AdminSidebar = () => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 right-4 z-40"
        onClick={toggleMobile}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar for Desktop */}
      <aside
        className={`bg-gray-50 border-r border-gray-200 hidden md:flex flex-col h-[calc(100vh-60px)] transition-all duration-300 ${
          collapsed ? 'w-[80px]' : 'w-[250px]'
        } sticky top-[60px]`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className={`font-semibold transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Admin Menu
          </h2>
          <Button variant="ghost" size="icon" onClick={toggleCollapse}>
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <span
                    className={`flex items-center py-2 px-3 rounded-md ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100'
                    } transition-colors duration-150 ${collapsed ? 'justify-center' : ''}`}
                  >
                    {item.icon}
                    <span className={`ml-3 transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                      {item.title}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobile}
      >
        <div
          className={`bg-white w-[280px] h-full transform transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold">Admin Menu</h2>
            <Button variant="ghost" size="icon" onClick={toggleMobile}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="overflow-y-auto h-[calc(100%-60px)]">
            <ul className="space-y-1 p-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span
                      className={`flex items-center py-2 px-3 rounded-md ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      } transition-colors duration-150`}
                      onClick={toggleMobile}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;