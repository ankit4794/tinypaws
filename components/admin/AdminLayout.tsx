import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { withAdminProtectedRoute } from '@/lib/admin-protected-route';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const isLoginPage = router.pathname === '/admin/login';

  // Only show the admin layout on non-login pages
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden p-6 max-w-screen">
          {children}
        </main>
      </div>
      <AdminFooter />
    </div>
  );
};

// Export the component with admin protection
export default withAdminProtectedRoute(AdminLayout);

// Also export an unwrapped version for the login page
export const UnprotectedAdminLayout = ({ children }: AdminLayoutProps) => {
  return <>{children}</>;
};