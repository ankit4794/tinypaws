import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";

// This is a simple component that checks admin auth
// We need to separate it this way to ensure the hook is only called
// within the component tree where the provider exists
function AdminRouteContent({ component: Component }: { component: React.ComponentType }) {
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
    // Use navigate instead of Redirect to avoid hooks ordering issues
    navigate("/admin/login");
    return null;
  }
  
  return <Component />;
}

// This is the actual route component that gets exported
export function AdminProtectedRoute({ path, component }: { path: string; component: React.ComponentType }) {
  return (
    <Route path={path}>
      {() => <AdminRouteContent component={component} />}
    </Route>
  );
}