import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ShoppingBag, Package, Eye, FileText, ChevronRight, AlertCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { withProtectedRoute } from '@/lib/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Fetch user orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user,
    retry: 1,
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

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

  // Filter orders by status
  const getFilteredOrders = (status: string) => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order: any) => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      );
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

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No orders found</h2>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet.
          </p>
          <Link href="/products">
            <Button size="lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="placed">Placed</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <OrderList
              orders={getFilteredOrders('all')}
              onViewOrder={handleViewOrder}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="placed" className="space-y-6">
            <OrderList
              orders={getFilteredOrders('placed')}
              onViewOrder={handleViewOrder}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-6">
            <OrderList
              orders={getFilteredOrders('confirmed')}
              onViewOrder={handleViewOrder}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="shipped" className="space-y-6">
            <OrderList
              orders={getFilteredOrders('shipped')}
              onViewOrder={handleViewOrder}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="delivered" className="space-y-6">
            <OrderList
              orders={getFilteredOrders('delivered')}
              onViewOrder={handleViewOrder}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            <OrderList
              orders={getFilteredOrders('cancelled')}
              onViewOrder={handleViewOrder}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDetails();
        }}
      >
        <DialogContent className="max-w-3xl">
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

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className="border rounded-md p-3">
                      <p className="font-medium">{selectedOrder.fullName}</p>
                      <p>{selectedOrder.address}</p>
                      <p>
                        {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                      </p>
                      <p>Phone: {selectedOrder.mobile}</p>
                      <p>Email: {selectedOrder.email}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="border rounded-md p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">GST (18%):</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span>{formatCurrency(selectedOrder.deliveryCharge)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Payment Method</h3>
                  <div className="border rounded-md p-3">
                    {selectedOrder.paymentMethod === 'cod' ? (
                      <p>Cash on Delivery (COD)</p>
                    ) : (
                      <p>Online Payment</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Order Items</h3>
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

                {selectedOrder.trackingNumber && (
                  <div>
                    <h3 className="font-medium mb-2">Tracking Information</h3>
                    <div className="border rounded-md p-3">
                      <p>
                        <span className="font-medium">Tracking Number:</span> {selectedOrder.trackingNumber}
                      </p>
                      <p>
                        <span className="font-medium">Courier:</span> {selectedOrder.courier || 'Standard Delivery'}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.deliveryInstructions && (
                  <div>
                    <h3 className="font-medium mb-2">Delivery Instructions</h3>
                    <div className="border rounded-md p-3">
                      <p>{selectedOrder.deliveryInstructions}</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {selectedOrder.status === 'placed' && (
                  <Button variant="destructive">
                    Cancel Order
                  </Button>
                )}
                <Button variant="outline" onClick={handleCloseDetails}>
                  Close
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Order List Component
function OrderList({
  orders,
  onViewOrder,
  formatCurrency,
  getStatusBadge,
}: {
  orders: any[];
  onViewOrder: (order: any) => void;
  formatCurrency: (amount: number) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id} className="overflow-hidden">
          <CardHeader className="bg-muted/50 py-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base">Order #{order.orderNumber}</CardTitle>
                <CardDescription>
                  Placed on {format(new Date(order.createdAt), 'dd MMM yyyy')}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium mb-1">Items</h3>
                <div className="flex gap-2">
                  {order.items.slice(0, 3).map((item: any) => (
                    <div key={item._id} className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
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
                  ))}
                  {order.items.length > 3 && (
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">+{order.items.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Total</h3>
                <p className="font-medium">{formatCurrency(order.total)}</p>
                <p className="text-xs text-muted-foreground">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => onViewOrder(order)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default withProtectedRoute(OrdersPage);