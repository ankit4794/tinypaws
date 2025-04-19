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
  ChevronDown, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/use-auth';

// Order status options
const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
];

export default function OrdersAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState({});

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Fetch orders
    const fetchOrders = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', currentPage.toString());
        if (searchTerm) queryParams.append('search', searchTerm);
        if (statusFilter) queryParams.append('status', statusFilter);

        const response = await fetch(`/api/admin/orders?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive"
        });
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchOrders();
    }
  }, [user, currentPage, searchTerm, statusFilter, toast]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Search is already handled by the useEffect
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setStatusFilter('');
    setCurrentPage(1);
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
        setIsViewingDetails(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const closeOrderDetails = () => {
    setIsViewingDetails(false);
    setOrderDetails(null);
  };

  const toggleStatusDropdown = (orderId) => {
    setShowStatusDropdown(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update the order status in the UI
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        
        // Close the dropdown
        setShowStatusDropdown(prev => ({
          ...prev,
          [orderId]: false
        }));
        
        toast({
          title: "Success",
          description: "Order status updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
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

  const getStatusLabel = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Orders Management</h1>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by order ID or customer name..."
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

              <div className="flex gap-2 w-full md:w-48">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {ORDER_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusFilter && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleClearFilter}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter ? "No orders found matching your criteria." : "No orders found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.userName}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="relative">
                          <button
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                            onClick={() => toggleStatusDropdown(order.id)}
                          >
                            {getStatusLabel(order.status)}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </button>
                          
                          {showStatusDropdown[order.id] && (
                            <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-md shadow-lg border border-gray-200 w-40">
                              {ORDER_STATUSES.map((status) => (
                                <button
                                  key={status.value}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${order.status === status.value ? 'bg-gray-50 font-medium' : ''}`}
                                  onClick={() => updateOrderStatus(order.id, status.value)}
                                  disabled={isUpdatingStatus}
                                >
                                  {status.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${
                          order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => viewOrderDetails(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
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

      {/* Order Details Modal */}
      {isViewingDetails && orderDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium">Order #{orderDetails.id}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={closeOrderDetails}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="text-sm">
                    <p><span className="text-gray-500">Name:</span> {orderDetails.userName}</p>
                    <p><span className="text-gray-500">Email:</span> {orderDetails.userEmail}</p>
                    <p><span className="text-gray-500">Phone:</span> {orderDetails.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Order Information</h4>
                  <div className="text-sm">
                    <p><span className="text-gray-500">Date:</span> {new Date(orderDetails.createdAt).toLocaleString()}</p>
                    <p>
                      <span className="text-gray-500">Status:</span> 
                      <span className={`ml-1 inline-block py-1 px-2 rounded-full text-xs font-medium ${getStatusColor(orderDetails.status)}`}>
                        {getStatusLabel(orderDetails.status)}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Payment Method:</span> 
                      <span className={`ml-1 inline-block py-1 px-2 rounded-full text-xs font-medium ${
                        orderDetails.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {orderDetails.paymentMethod === 'COD' ? 'Cash on Delivery' : orderDetails.paymentMethod}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <div className="text-sm">
                  {orderDetails.shippingAddress ? (
                    <>
                      <p>{orderDetails.shippingAddress.addressLine1}</p>
                      {orderDetails.shippingAddress.addressLine2 && <p>{orderDetails.shippingAddress.addressLine2}</p>}
                      <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}</p>
                    </>
                  ) : (
                    <p>No shipping address provided</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderDetails.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name} 
                                  className="h-10 w-10 rounded-md object-cover mr-3"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 mr-3" />
                              )}
                              <div>
                                <p className="font-medium">{item.product.name}</p>
                                {item.options && Object.keys(item.options).length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    {Object.entries(item.options).map(([key, value]) => (
                                      `${key}: ${value}`
                                    )).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{item.quantity}</td>
                          <td className="px-4 py-4">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-4">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>₹{orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping:</span>
                  <span>₹{orderDetails.shippingCost.toFixed(2)}</span>
                </div>
                {orderDetails.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount:</span>
                    <span>-₹{orderDetails.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-base mt-2">
                  <span>Total:</span>
                  <span>₹{orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-6 flex justify-between">
                <Select 
                  value={orderDetails.status} 
                  onValueChange={(value) => updateOrderStatus(orderDetails.id, value)}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={closeOrderDetails}>
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