import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminHeader() {
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin" className="text-xl font-bold">
              TinyPaws Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/admin"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/admin/customers"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Customers
            </Link>
            <Link
              href="/admin/categories"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/admin/reviews"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Reviews
            </Link>
            <Link
              href="/admin/pincodes"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Pincodes
            </Link>
            <Link
              href="/admin/help-desk"
              className="text-gray-200 hover:text-white transition-colors"
            >
              Help Desk
            </Link>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 text-gray-200">
                    <User className="mr-2 h-4 w-4" /> {user.email}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.fullName || "Administrator"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/admin/login">
                <Button variant="outline" className="text-white">
                  Login
                </Button>
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="mt-4 lg:hidden">
            <nav className="flex flex-col space-y-4 py-4">
              <Link
                href="/admin"
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Orders
              </Link>
              <Link
                href="/admin/customers"
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Customers
              </Link>
              <Link
                href="/admin/categories"
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/admin/reviews"
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                href="/admin/pincodes"
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pincodes
              </Link>
              <Link
                href="/admin/help-desk"
                className="text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Help Desk
              </Link>
              {user ? (
                <Button
                  variant="ghost"
                  className="justify-start text-gray-200 hover:text-white p-0"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              ) : (
                <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full text-white"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}