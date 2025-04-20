import * as React from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/layout';

// HOC version for Next.js admin pages
export function withAdminProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: { layout?: boolean }
) {
  return function AdminProtectedRoute(props: P) {
    const { adminUser, isLoading } = useAdminAuth();
    const router = useRouter();
    const useLayout = options?.layout !== false;

    React.useEffect(() => {
      if (!isLoading && !adminUser) {
        router.push('/admin/login');
      }
    }, [adminUser, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }

    if (!adminUser) {
      return null; // Don't render anything if redirecting
    }

    // Wrap the component with admin layout if layout option is true
    if (useLayout) {
      return (
        <AdminLayout>
          <Component {...props} />
        </AdminLayout>
      );
    }

    // Otherwise, render the component directly
    return <Component {...props} />;
  };
}