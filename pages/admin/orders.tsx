import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ShoppingBag, Truck, Package, Search, Eye, Printer, CheckCircle, XCircle, Edit, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { withAdminProtectedRoute } from '@/lib/admin-protected-route';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Define schema for order tracking update
const updateOrderSchema = z.object({
  status: z.enum(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
    required_error: 'Please select an order status',
  }),
  trackingNumber: z.string().optional(),
  courier: z.string().optional(),
  notes: z.string().optional(),
});

type UpdateOrderFormValues = z.infer<typeof updateOrderSchema>;

function AdminOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dateRange, setDateRange] = React.useState({
    from: '',
    to: '',
  });

  // Form for updating order status
  const form = useForm<UpdateOrderFormValues>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      status: 'placed',
      trackingNumber: '',
      courier: '',
      notes: '',
    },
  });

  // Fetch all orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    retry: 1,
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderFormValues }) => {
      return apiRequest('PATCH', `/api/admin/orders/${id}`, data).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });
      setIsDetailsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Reset form when opening order details
  React.useEffect(() => {
    if (selectedOrder) {
      form.reset({
        status: selectedOrder.status,
        trackingNumber: selectedOrder.trackingNumber || '',
        courier: selectedOrder.courier || '',
        notes: selectedOrder.notes || '',
      });
    }
  }, [selectedOrder, form]);

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return <Badge variant="outline">Placed</Badge>;
      case 'confirmed':
        return <Badge variant="secondary">Confirmed</Badge>;
      case 'shipped':
        return <Badge variant="secondary">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter orders by status and search
  const getFilteredOrders = (status: string) => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order: any) => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.fullName.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.mobile.includes(query)
      );
    }
    
    // Filter by date range if present
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }
    
    // Filter by status if not 'all'
    if (status !== 'all') {
      filtered = filtered.filter((order: any) => order.status === status);
    }
    
    return filtered;
  };

  // View order details
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Close order details dialog
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  // Handle form submission
  const onSubmit = (data: UpdateOrderFormValues) => {
    if (selectedOrder) {
      updateOrderMutation.mutate({
        id: selectedOrder._id,
        data,
      });
    }
  };

  // Print invoice
  const handlePrintInvoice = (orderId: string) => {
    // Open invoice in new window/tab
    window.open(`/api/admin/orders/${orderId}/invoice`, '_blank');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and process customer orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">{orders?.length || 0}</h3>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold">
                {orders?.filter((o: any) => o.status === 'placed').length || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <h3 className="text-2xl font-bold">
                {orders?.filter((o: any) => 
                  o.status === 'confirmed' || o.status === 'shipped'
                ).length || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <h3 className="text-2xl font-bold">
                {orders?.filter((o: any) => o.status === 'delivered').length || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
            <div>
              <label htmlFor="date-from" className="block text-sm mb-1">From</label>
              <Input
                id="date-from"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="date-to" className="block text-sm mb-1">To</label>
              <Input
                id="date-to"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
          <div className="flex-shrink-0">
            <label className="block text-sm mb-1">Actions</label>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchQuery('');
                setDateRange({ from: '', to: '' });
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage customer orders</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">No Orders Found</h2>
              <p className="text-muted-foreground">
                There are no orders to display at this time.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <div className="px-6">
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="placed">Placed</TabsTrigger>
                  <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                  <TabsTrigger value="shipped">Shipped</TabsTrigger>
                  <TabsTrigger value="delivered">Delivered</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all">
                <OrdersTable
                  orders={getFilteredOrders('all')}
                  onViewOrder={handleViewOrder}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onPrintInvoice={handlePrintInvoice}
                />
              </TabsContent>

              <TabsContent value="placed">
                <OrdersTable
                  orders={getFilteredOrders('placed')}
                  onViewOrder={handleViewOrder}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onPrintInvoice={handlePrintInvoice}
                />
              </TabsContent>

              <TabsContent value="confirmed">
                <OrdersTable
                  orders={getFilteredOrders('confirmed')}
                  onViewOrder={handleViewOrder}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onPrintInvoice={handlePrintInvoice}
                />
              </TabsContent>

              <TabsContent value="shipped">
                <OrdersTable
                  orders={getFilteredOrders('shipped')}
                  onViewOrder={handleViewOrder}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onPrintInvoice={handlePrintInvoice}
                />
              </TabsContent>

              <TabsContent value="delivered">
                <OrdersTable
                  orders={getFilteredOrders('delivered')}
                  onViewOrder={handleViewOrder}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onPrintInvoice={handlePrintInvoice}
                />
              </TabsContent>

              <TabsContent value="cancelled">
                <OrdersTable
                  orders={getFilteredOrders('cancelled')}
                  onViewOrder={handleViewOrder}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  onPrintInvoice={handlePrintInvoice}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDetails();
        }}
      >
        <DialogContent className="max-w-4xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>Order #{selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.status)}
                </DialogTitle>
                <DialogDescription>
                  Placed on {format(new Date(selectedOrder.createdAt), 'dd MMM yyyy, HH:mm')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Customer Details</h3>
                      <div className="border rounded-md p-3">
                        <p className="font-medium">{selectedOrder.fullName}</p>
                        <p>Email: {selectedOrder.email}</p>
                        <p>Phone: {selectedOrder.mobile}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Shipping Address</h3>
                      <div className="border rounded-md p-3">
                        <p>{selectedOrder.address}</p>
                        <p>
                          {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item: any) => (
                            <TableRow key={item._id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                                    {item.product?.image ? (
                                      <Image
                                        src={item.product.image}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {item.product?.name || 'Product Unavailable'}
                                    </p>
                                    {(item.weight || item.pack || item.variant) && (
                                      <p className="text-xs text-muted-foreground">
                                        {item.weight && `Weight: ${item.weight}`}
                                        {item.weight && item.pack && ' • '}
                                        {item.pack && `Pack: ${item.pack}`}
                                        {(item.weight || item.pack) && item.variant && ' • '}
                                        {item.variant && `Variant: ${item.variant}`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.price)}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.price * item.quantity)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="border rounded-md p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (18%):</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span>{formatCurrency(selectedOrder.deliveryCharge)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span>
                          {selectedOrder.paymentMethod === 'cod'
                            ? 'Cash on Delivery (COD)'
                            : 'Online Payment'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.deliveryInstructions && (
                    <div>
                      <h3 className="font-medium mb-2">Delivery Instructions</h3>
                      <div className="border rounded-md p-3">
                        <p>{selectedOrder.deliveryInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <h3 className="font-medium mb-2">Update Order Status</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-md p-3">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="placed">Placed</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(form.watch('status') === 'shipped' || form.watch('status') === 'delivered') && (
                        <>
                          <FormField
                            control={form.control}
                            name="trackingNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tracking Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter tracking number"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="courier"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Courier Service</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter courier service name"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Add internal notes"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              These notes are for internal use only
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={updateOrderMutation.isPending}
                        className="w-full"
                      >
                        {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handlePrintInvoice(selectedOrder._id)}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Orders Table Component
function OrdersTable({
  orders,
  onViewOrder,
  formatCurrency,
  getStatusBadge,
  onPrintInvoice,
}: {
  orders: any[];
  onViewOrder: (order: any) => void;
  formatCurrency: (amount: number) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  onPrintInvoice: (orderId: string) => void;
}) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="border-t">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">#{order.orderNumber}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.fullName}</p>
                  <p className="text-xs text-muted-foreground">{order.email}</p>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(order.createdAt), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
              </TableCell>
              <TableCell>{formatCurrency(order.total)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewOrder(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPrintInvoice(order._id)}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default withAdminProtectedRoute(AdminOrdersPage);