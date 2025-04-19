import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useAdminDashboard } from '@/hooks/admin';
import { Loader2, Package, ShoppingBag, Users } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminDashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const { data: dashboardData, isLoading, error } = useAdminDashboard();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  // Loading state
  if (isUserLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-xl font-bold text-destructive">Error loading dashboard</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Across all time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              The most recent orders placed on the store
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentOrders?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left font-medium p-2">Order ID</th>
                      <th className="text-left font-medium p-2">Date</th>
                      <th className="text-left font-medium p-2">Status</th>
                      <th className="text-left font-medium p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentOrders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="p-2">{order.id}</td>
                        <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs 
                            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2">₹{order.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No recent orders</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}