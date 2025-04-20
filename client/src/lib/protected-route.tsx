import { useAuth } from "@/hooks/use-auth";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { ComponentType } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Render the component if authenticated
  return <Route path={path} component={Component} />;
}

// High-order component that wraps a component with admin authentication
export function withAdminRoute<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  // Return a new component that includes the admin auth check
  return function AdminProtectedComponent(props: P) {
    const { adminUser, isLoading } = useAdminAuth();
    const [, navigate] = useLocation();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }
    
    if (!adminUser) {
      // We need to redirect to the login page programmatically
      navigate("/admin/login");
      return null;
    }
    
    // If we have an admin user, render the wrapped component with its props
    return <Component {...props} />;
  };
}