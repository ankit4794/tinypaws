import { ReactNode, useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <AdminHeader />
      
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <AdminSidebar />
        
        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <Button 
            variant="default" 
            size="icon" 
            className="bg-primary rounded-full shadow-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)}></div>
            <div className="absolute left-0 top-0 h-full w-64 bg-slate-800 shadow-lg">
              <AdminSidebar />
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <AdminFooter />
    </div>
  );
}