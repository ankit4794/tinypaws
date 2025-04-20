import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Eye, Ban, Mail, PlusCircle, AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Schema for customer form
const customerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface Customer {
  _id: string;
  fullName?: string;
  email: string;
  mobile?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  orderCount?: number;
  status?: 'active' | 'inactive' | 'blocked';
}

export default function CustomersManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch customers
  const { 
    data: customers = [], 
    isLoading,
    error 
  } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/customers");
      return await res.json();
    },
  });

  // Mutation for adding a new customer
  const addCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      const res = await apiRequest("POST", "/api/admin/customers", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
      
      // Refetch the customers list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive",
      });
    },
  });

  // Form for adding a new customer
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      password: "",
      address: {
        street: "",
        city: "",
        state: "",
        pincode: "",
      },
    },
  });

  // Handle form submission
  const onSubmit = (data: CustomerFormValues) => {
    addCustomerMutation.mutate(data);
  };

  // Filter customers based on search query
  const filteredCustomers = customers ? customers.filter(customer => 
    customer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobile?.includes(searchQuery)
  ) : [];

  return (
    <AdminLayout>
      <div className="py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Customers Management</CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email or phone..."
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
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-1">Error Loading Customers</h3>
                <p className="text-muted-foreground mb-4">
                  An error occurred while loading customer data.
                </p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({queryKey: ["/api/admin/customers"]})}
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer._id}>
                          <TableCell className="font-medium">{customer.fullName || "Unknown"}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.mobile || "—"}</TableCell>
                          <TableCell>
                            {customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy') : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                customer.status === 'blocked' ? "bg-red-100 text-red-800" : 
                                customer.status === 'inactive' ? "bg-gray-100 text-gray-800" : 
                                "bg-green-100 text-green-800"
                              }
                            >
                              {customer.status || "active"}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.orderCount || 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedCustomer(customer)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  window.location.href = `mailto:${customer.email}`;
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Mail className="h-4 w-4" />
                                <span className="sr-only">Email</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                                disabled={customer.status === 'blocked'}
                              >
                                <Ban className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Block</span>
                              </Button>
                            </div>
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
        
        {/* Customer Details Dialog */}
        <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Customer Info</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="addresses">Addresses</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Full Name</p>
                      <p>{selectedCustomer.fullName || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Email</p>
                      <p>{selectedCustomer.email || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Phone</p>
                      <p>{selectedCustomer.mobile || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Member Since</p>
                      <p>
                        {selectedCustomer.createdAt ? format(new Date(selectedCustomer.createdAt), 'PPP') : "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>
                      <Badge 
                        className={
                          selectedCustomer.status === 'blocked' ? "bg-red-100 text-red-800" : 
                          selectedCustomer.status === 'inactive' ? "bg-gray-100 text-gray-800" : 
                          "bg-green-100 text-green-800"
                        }
                      >
                        {selectedCustomer.status || "active"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Last Updated</p>
                      <p>
                        {selectedCustomer.updatedAt ? format(new Date(selectedCustomer.updatedAt), 'PPP') : "—"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 space-x-2">
                    <Button variant="outline">Edit Details</Button>
                    <Button variant="outline" className="border-red-200 hover:bg-red-50 text-red-600">
                      {selectedCustomer.status === 'blocked' ? 'Unblock Customer' : 'Block Customer'}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="orders" className="py-4">
                  <p className="text-center text-muted-foreground mb-4">
                    {selectedCustomer.orderCount ? `This customer has placed ${selectedCustomer.orderCount} orders.` : "No orders found for this customer."}
                  </p>
                  {/* In a complete implementation, we would fetch and display orders here */}
                  <div className="border rounded-md p-4 text-center">
                    <Button variant="outline">View All Orders</Button>
                  </div>
                </TabsContent>
                <TabsContent value="addresses" className="py-4">
                  <p className="text-center text-muted-foreground mb-4">
                    {selectedCustomer.address ? "Customer has a saved address." : "No saved addresses found."}
                  </p>
                  {selectedCustomer.address && (
                    <div className="mt-4 p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Primary Address</h3>
                      <p>{selectedCustomer.address.street || "—"}</p>
                      <p>
                        {selectedCustomer.address.city || "—"}{selectedCustomer.address.city ? "," : ""} {selectedCustomer.address.state || "—"} {selectedCustomer.address.pincode || "—"}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Customer Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Create a new customer account. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="customer@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <h3 className="text-sm font-medium mt-4">Address (Optional)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address.pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="Pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    disabled={addCustomerMutation.isPending}
                  >
                    {addCustomerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : "Add Customer"}
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