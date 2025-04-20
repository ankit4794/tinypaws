import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  Star,
  MapPin,
  MessageSquare,
  CreditCard,
  FileText,
  Settings,
  Tag,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Brands', href: '/admin/brands', icon: Tag },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Pincodes', href: '/admin/pincodes', icon: MapPin },
  { name: 'Help Desk', href: '/admin/help-desk', icon: MessageSquare },
  { name: 'CMS Pages', href: '/admin/cms', icon: FileText },
  { name: 'Promotions', href: '/admin/promotions', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings }
];

export default function AdminSidebar() {
  const [location] = useLocation();

  return (
    <aside className="min-h-screen bg-slate-800 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-xl font-bold">TinyPaws Admin</span>
        </Link>
      </div>
      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-700 text-white" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}