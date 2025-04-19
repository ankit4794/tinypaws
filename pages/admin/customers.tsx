import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  UserX,
  UserCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/use-auth';

export default function CustomersAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Fetch customers
    const fetchCustomers = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', currentPage.toString());
        if (searchTerm) queryParams.append('search', searchTerm);

        const response = await fetch(`/api/admin/customers?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.customers);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive"
        });
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchCustomers();
    }
  }, [user, currentPage, searchTerm, toast]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Search is already handled by the useEffect
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const viewCustomerDetails = async (customerId) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomerDetails(data);
        setIsViewingDetails(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch customer details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customer details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const closeCustomerDetails = () => {
    setIsViewingDetails(false);
    setCustomerDetails(null);
  };

  const toggleUserStatus = async (customerId, isActive) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });
      
      if (response.ok) {
        // Update the customer status in the UI
        setCustomers(customers.map(customer => 
          customer.id === customerId ? { ...customer, isActive } : customer
        ));
        
        if (customerDetails && customerDetails.id === customerId) {
          setCustomerDetails({ ...customerDetails, isActive });
        }
        
        toast({
          title: "Success",
          description: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update customer status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast({
        title: "Error",
        description: "Failed to update customer status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Customers Management</h1>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit">Search</Button>
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No customers found matching your search." : "No customers found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.fullName || 'N/A'}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{customer.orderCount || 0}</TableCell>
                      <TableCell>
                        <span className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${
                          customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => viewCustomerDetails(customer.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleUserStatus(customer.id, !customer.isActive)}
                            disabled={isUpdatingStatus}
                          >
                            {customer.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-1 text-red-500" />
                                Disable
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-1 text-green-500" />
                                Enable
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Modal */}
      {isViewingDetails && customerDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium">Customer Details</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={closeCustomerDetails}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {customerDetails.fullName || 'N/A'}</p>
                    <p><span className="text-gray-500">Email:</span> {customerDetails.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {customerDetails.mobile || 'N/A'}</p>
                    <p><span className="text-gray-500">Member Since:</span> {new Date(customerDetails.createdAt).toLocaleDateString()}</p>
                    <p>
                      <span className="text-gray-500">Status:</span> 
                      <span className={`ml-2 inline-block py-1 px-2 rounded-full text-xs font-medium ${
                        customerDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customerDetails.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">User ID:</span> {customerDetails.id}</p>
                    <p><span className="text-gray-500">Username:</span> {customerDetails.username}</p>
                    <p><span className="text-gray-500">Orders:</span> {customerDetails.orderCount || 0}</p>
                    <p><span className="text-gray-500">Last Order:</span> {customerDetails.lastOrderDate ? new Date(customerDetails.lastOrderDate).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="text-gray-500">Last Login:</span> {customerDetails.lastLogin ? new Date(customerDetails.lastLogin).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {customerDetails.address && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Default Address</h4>
                  <div className="text-sm">
                    <p>{customerDetails.address.addressLine1}</p>
                    {customerDetails.address.addressLine2 && <p>{customerDetails.address.addressLine2}</p>}
                    <p>{customerDetails.address.city}, {customerDetails.address.state} {customerDetails.address.zipCode}</p>
                    <p>{customerDetails.address.country}</p>
                  </div>
                </div>
              )}

              {customerDetails.recentOrders && customerDetails.recentOrders.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Recent Orders</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customerDetails.recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-4 text-sm">{order.id}</td>
                            <td className="px-4 py-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-4 text-sm">₹{order.total.toFixed(2)}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${
                                order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' : 
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-200 mt-6 pt-6 flex justify-between">
                <Button 
                  variant={customerDetails.isActive ? "destructive" : "default"}
                  onClick={() => toggleUserStatus(customerDetails.id, !customerDetails.isActive)}
                  disabled={isUpdatingStatus}
                >
                  {customerDetails.isActive ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Disable Account
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Enable Account
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={closeCustomerDetails}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}