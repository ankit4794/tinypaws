import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { ComponentType, useEffect } from 'react';

export function withProtectedRoute<P extends object>(
  Component: ComponentType<P>,
  options: { redirectTo?: string; adminOnly?: boolean } = {}
) {
  const { redirectTo = '/auth', adminOnly = false } = options;

  return function ProtectedRoute(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push(redirectTo);
        } else if (adminOnly && user.role !== 'ADMIN') {
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

    if (!user) {
      return null;
    }

    if (adminOnly && user.role !== 'ADMIN') {
      return null;
    }

    return <Component {...props} />;
  };
}

// Admin only route
export function withAdminRoute<P extends object>(Component: ComponentType<P>) {
  return withProtectedRoute(Component, { adminOnly: true, redirectTo: '/' });
}