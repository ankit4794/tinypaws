import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/orders");
      return await res.json();
    },
  });

  // Filter orders based on search query and status filter
  const filteredOrders = orders ? orders.filter(order => {
    const matchesSearch = 
      order._id.includes(searchQuery) || 
      (order.user?.fullName && order.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Orders Management</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by order ID or customer name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order._id.slice(-8)}</TableCell>
                        <TableCell>{order.user?.fullName || "Unknown"}</TableCell>
                        <TableCell>
                          {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : "N/A"}
                        </TableCell>
                        <TableCell>₹{order.total?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{order.paymentMethod || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?._id?.slice(-8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid grid-cols-1 gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p>{selectedOrder.user?.fullName || "Unknown"}</p>
                  <p>{selectedOrder.user?.email || "No email"}</p>
                  <p>{selectedOrder.user?.mobile || "No phone"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress?.street || "No address"}</p>
                  <p>
                    {selectedOrder.shippingAddress?.city || ""}{" "}
                    {selectedOrder.shippingAddress?.state || ""}{" "}
                    {selectedOrder.shippingAddress?.pincode || ""}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.productImage && (
                                  <img 
                                    src={item.productImage} 
                                    alt={item.productName} 
                                    className="h-10 w-10 rounded-md object-cover"
                                  />
                                )}
                                <div>{item.productName}</div>
                              </div>
                            </TableCell>
                            <TableCell>₹{item.price?.toFixed(2) || "0.00"}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No items found
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Total</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{selectedOrder.total?.toFixed(2) || "0.00"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}