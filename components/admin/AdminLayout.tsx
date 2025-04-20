import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { withAdminProtectedRoute } from '@/lib/admin-protected-route';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import {
  ChevronDown,
  Settings,
  ShoppingBag,
  Package,
  Mail,
  FileText,
  Users,
  MessageSquare,
  Bell,
  LogOut,
  PanelLeft,
  Heart,
  Home,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { adminUser, adminLogoutMutation } = useAdminAuth();
  const router = useRouter();
  const isLoginPage = router.pathname === '/admin/login';
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    adminLogoutMutation.mutate();
  };

  // Only show the admin layout on non-login pages
  if (isLoginPage) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    return router.pathname.startsWith(path) ? 'bg-primary/10 text-primary' : '';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold">TinyPaws Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground">
              View Store
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {adminUser?.fullName || adminUser?.email || 'Admin'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed z-30 ${
            sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
          } h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300 md:translate-x-0`}
        >
          <nav className="flex flex-col gap-1 p-2">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/dashboard'
              )}`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/products'
              )}`}
            >
              <ShoppingBag className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin/categories"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/categories'
              )}`}
            >
              <Tag className="h-4 w-4" />
              Categories
            </Link>
            <Link
              href="/admin/brands"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/brands'
              )}`}
            >
              <Package className="h-4 w-4" />
              Brands
            </Link>
            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/orders'
              )}`}
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/admin/customers"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/customers'
              )}`}
            >
              <Users className="h-4 w-4" />
              Customers
            </Link>
            <Link
              href="/admin/newsletter"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/newsletter'
              )}`}
            >
              <Mail className="h-4 w-4" />
              Newsletter
            </Link>
            <Link
              href="/admin/helpdesk"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/helpdesk'
              )}`}
            >
              <MessageSquare className="h-4 w-4" />
              Helpdesk
            </Link>
            <Link
              href="/admin/reviews"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/reviews'
              )}`}
            >
              <Heart className="h-4 w-4" />
              Reviews
            </Link>
            <Link
              href="/admin/cms"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/cms'
              )}`}
            >
              <FileText className="h-4 w-4" />
              CMS Pages
            </Link>
            <Link
              href="/admin/contact-messages"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/contact-messages'
              )}`}
            >
              <MessageSquare className="h-4 w-4" />
              Contact Messages
            </Link>
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive(
                '/admin/settings'
              )}`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } transition-all duration-300`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer
        className={`border-t p-4 text-center text-sm text-muted-foreground ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        } transition-all duration-300`}
      >
        <p>© {new Date().getFullYear()} TinyPaws Admin. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Export the component with admin protection
export default withAdminProtectedRoute(AdminLayout);

// Also export an unwrapped version for the login page
export const UnprotectedAdminLayout = ({ children }: AdminLayoutProps) => {
  return <>{children}</>;
};