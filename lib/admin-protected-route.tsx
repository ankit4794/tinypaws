import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { ComponentType, useEffect } from 'react';

export function withAdminProtectedRoute<P extends object>(
  Component: ComponentType<P>
) {
  return function AdminProtectedRoute(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push('/auth');
        } else if (user.role !== 'ADMIN') {
          router.push('/');
        }
      }
    }, [isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }

    if (!user || user.role !== 'ADMIN') {
      return null;
    }

    return <Component {...props} />;
  };
}