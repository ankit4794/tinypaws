import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import dynamic from 'next/dynamic';

// Dynamically import the AdminLayout to avoid circular dependency issues
const AdminLayout = dynamic(() => import('../admin/AdminLayout'), { 
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading admin layout...</div> 
});

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  
  // Don't apply admin layout to the admin login page
  const isAdminLoginPage = router.pathname === '/admin/login';
  
  if (isAdminRoute && !isAdminLoginPage) {
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <main className={`flex-grow ${!isAdminRoute ? '' : 'w-full'}`}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default Layout;