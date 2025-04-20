import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Loader2 } from 'lucide-react';

export function withAdminProtectedRoute<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminProtectedRoute(props: P) {
    const { adminUser, isLoading } = useAdminAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (!isLoading && !adminUser) {
        router.replace('/admin/login');
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
      return null; // Don't render the component if not authenticated
    }
    
    return <Component {...props} />;
  };
}