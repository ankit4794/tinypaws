import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { CustomizableDashboard } from '@/components/admin/widgets';

export default function AdminDashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  // Loading state
  if (isUserLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <CustomizableDashboard />
    </AdminLayout>
  );
}