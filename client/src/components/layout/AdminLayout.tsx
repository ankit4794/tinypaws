import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import {
  ChevronLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Briefcase,
  FileText,
  MessageSquare,
  Mail,
  Star,
  MapPin,
  LogOut,
  Ticket,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [currentPath] = useLocation();
  const { adminUser, adminLogoutMutation } = useAdminAuth();
  
  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };
  
  const handleLogout = () => {
    adminLogoutMutation.mutate();
  };
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/admin/products', label: 'Products', icon: <Package className="h-5 w-5" /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { path: '/admin/customers', label: 'Customers', icon: <Users className="h-5 w-5" /> },
    { path: '/admin/categories', label: 'Categories', icon: <Tag className="h-5 w-5" /> },
    { path: '/admin/brands', label: 'Brands', icon: <Briefcase className="h-5 w-5" /> },
    { path: '/admin/promotions', label: 'Promotions', icon: <Ticket className="h-5 w-5" /> },
    { path: '/admin/cms', label: 'CMS Pages', icon: <FileText className="h-5 w-5" /> },
    { path: '/admin/helpdesk', label: 'Helpdesk', icon: <MessageSquare className="h-5 w-5" /> },
    { path: '/admin/newsletter', label: 'Newsletter', icon: <Mail className="h-5 w-5" /> },
    { path: '/admin/reviews', label: 'Reviews', icon: <Star className="h-5 w-5" /> },
    { path: '/admin/pincodes', label: 'Delivery Areas', icon: <MapPin className="h-5 w-5" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top navigation */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 h-16 flex items-center px-4 lg:px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-6">
              <Button variant="outline" size="icon" className="mr-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-bold text-xl">TinyPaws Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder-user.jpg" alt="Admin user" />
                    <AvatarFallback>
                      {adminUser?.fullName?.substring(0, 2) || adminUser?.email?.substring(0, 2) || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{adminUser?.fullName || 'Admin User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{adminUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r dark:border-gray-700 bg-white dark:bg-gray-800">
          <nav className="p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <div 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}