import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/layout";
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Loader2, Search, Eye, PlusCircle, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

// Schema for order form
const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productName: z.string().min(1, "Product name is required"),
  productImage: z.string().optional(),
  price: z.number().min(0, "Price must be at least 0"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  selectedColor: z.string().optional(),
  selectedSize: z.string().optional(),
});

const orderSchema = z.object({
  userId: z.string().min(1, "Customer is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  total: z.number().min(0, "Total must be at least 0"),
  status: z.string().min(1, "Status is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  shippingAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(1, "Pincode is required")
  })
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderItem {
  _id?: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface Order {
  _id: string;
  user?: {
    _id: string;
    fullName?: string;
    email?: string;
    mobile?: string;
  };
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  _id: string;
  fullName?: string;
  email: string;
  mobile?: string;
}

interface Product {
  _id: string;
  name: string;
  images?: string[];
  price: number;
}

export default function OrdersManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch orders
  const { 
    data: orders = [], 
    isLoading,
    error 
  } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/orders");
      return await res.json();
    },
  });

  // Fetch customers for the dropdown
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/customers");
      return await res.json();
    },
  });

  // Fetch products for the dropdown
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/products");
      return await res.json();
    },
    // If this endpoint requires authentication and isn't working yet, you can disable the query
    enabled: false,
  });

  // Mutation for adding a new order
  const addOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      const res = await apiRequest("POST", "/api/admin/orders", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order added successfully",
      });
      setIsAddDialogOpen(false);
      // Refetch the orders list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add order",
        variant: "destructive",
      });
    },
  });

  // Form for adding a new order
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      userId: "",
      items: [
        {
          productId: "",
          productName: "",
          productImage: "",
          price: 0,
          quantity: 1,
          selectedColor: "",
          selectedSize: "",
        },
      ],
      total: 0,
      status: "PENDING",
      paymentMethod: "COD",
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        pincode: "",
      },
    },
  });

  // Field array for order items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Handle product selection
  const handleProductSelect = (productId: string, index: number) => {
    if (!products) return;
    
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct) {
      form.setValue(`items.${index}.productId`, selectedProduct._id);
      form.setValue(`items.${index}.productName`, selectedProduct.name);
      form.setValue(`items.${index}.productImage`, selectedProduct.images?.[0] || "");
      form.setValue(`items.${index}.price`, selectedProduct.price);
      
      // Recalculate total
      recalculateTotal();
    }
  };

  // Recalculate total when items change
  const recalculateTotal = () => {
    const items = form.getValues("items");
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    form.setValue("total", total);
  };

  // Handle form submission
  const onSubmit = (data: OrderFormValues) => {
    addOrderMutation.mutate(data);
  };

  // Filter orders based on search query and status filter
  const filteredOrders = orders ? orders.filter(order => {
    const matchesSearch = 
      order._id.includes(searchQuery) || 
      (order.user?.fullName && order.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadgeClass = (status: string) => {
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
    <AdminLayout>
      <div className="py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Orders Management</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Order
              </Button>
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
            ) : error ? (
              <div className="text-center my-8 text-red-500">
                <p>Failed to load orders. Please try again.</p>
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
                          selectedOrder.items.map((item, index) => (
                            <TableRow key={item._id || index}>
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
                
                <DialogFooter className="mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="default"
                    // This would be used to update the order status in a real application
                    // onClick={() => updateOrderStatus(selectedOrder._id, "PROCESSING")}
                  >
                    Update Status
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Order Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Order</DialogTitle>
              <DialogDescription>
                Create a new order manually. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Selection */}
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer._id} value={customer._id}>
                                {customer.fullName || customer.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Method */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="COD">Cash on Delivery</SelectItem>
                            <SelectItem value="ONLINE">Online Payment</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Street address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="State" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress.pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Pincode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    <Button 
                      type="button" 
                      onClick={() => append({
                        productId: "",
                        productName: "",
                        productImage: "",
                        price: 0,
                        quantity: 1,
                        selectedColor: "",
                        selectedSize: "",
                      })}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 mb-4 pb-4 border-b">
                      <div className="col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product *</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleProductSelect(value, index);
                                }} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product._id} value={product._id}>
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  {...field} 
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                    recalculateTotal();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field} 
                                  onChange={(e) => {
                                    field.onChange(parseInt(e.target.value));
                                    recalculateTotal();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <div className="pt-9">
                          <div className="text-sm font-medium mb-1">Subtotal</div>
                          <div>
                            ₹{
                              ((form.watch(`items.${index}.price`) || 0) * 
                              (form.watch(`items.${index}.quantity`) || 0)).toFixed(2)
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <div className="pt-9">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                remove(index);
                                recalculateTotal();
                              }}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end mt-4">
                    <div className="text-lg font-semibold">
                      Total: ₹{form.watch('total').toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={addOrderMutation.isPending}
                  >
                    {addOrderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      'Create Order'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}