import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Bell, ChevronDown, LogOut, Search, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function AdminHeader() {
  const { adminUser, adminLogoutMutation } = useAdminAuth();
  
  // Handle logout
  const handleLogout = () => {
    adminLogoutMutation.mutate();
  };

  return (
    <header className="bg-slate-900 text-white py-3 px-4 border-b border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center md:hidden">
          <Link href="/admin" className="text-xl font-bold">
            TinyPaws
          </Link>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="w-full bg-slate-800 border-slate-700 pl-8 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-3">
          <Button size="icon" variant="ghost" className="text-slate-200">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User menu */}
          {adminUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative text-slate-200 space-x-1">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{adminUser.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {adminUser.fullName || "Administrator"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {adminUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer w-full">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
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
        </div>
      </div>
    </header>
  );
}