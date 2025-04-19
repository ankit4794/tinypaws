import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";

export function AdminProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { adminUser, isLoading } = useAdminAuth();
  const [location, navigate] = useLocation();

  // Effect to check authentication and redirect if needed
  useEffect(() => {
    // If not loading and no admin user, redirect to login
    if (!isLoading && !adminUser && location.startsWith('/admin') && location !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [adminUser, isLoading, location, navigate]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!adminUser) {
    return (
      <Route path={path}>
        <Redirect to="/admin/login" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}