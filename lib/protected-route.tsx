import * as React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

// HOC version for Next.js pages
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
      if (!isLoading && !user) {
        router.push('/auth');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }

    if (!user) {
      return null; // Don't render anything if redirecting
    }

    return <Component {...props} />;
  };
}