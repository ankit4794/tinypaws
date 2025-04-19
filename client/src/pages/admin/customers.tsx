import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Eye, Ban, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function CustomersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Fetch customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/admin/customers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/customers");
      return await res.json();
    },
  });

  // Filter customers based on search query
  const filteredCustomers = customers ? customers.filter(customer => 
    customer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobile?.includes(searchQuery)
  ) : [];

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Customers Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
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
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined On</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium">{customer.fullName || "Unknown"}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.mobile || "None"}</TableCell>
                        <TableCell>
                          {customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy') : "N/A"}
                        </TableCell>
                        <TableCell>{customer.orderCount || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Ban className="h-4 w-4" />
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
                    <p className="text-sm text-muted-foreground">{selectedCustomer.fullName || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.mobile || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.createdAt ? format(new Date(selectedCustomer.createdAt), 'PPP') : "N/A"}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="orders" className="py-4">
                <p className="text-center text-sm text-muted-foreground">
                  {selectedCustomer.orderCount ? `This customer has placed ${selectedCustomer.orderCount} orders.` : "No orders found for this customer."}
                </p>
                {/* In a complete implementation, we would fetch and display orders here */}
              </TabsContent>
              <TabsContent value="addresses" className="py-4">
                <p className="text-center text-sm text-muted-foreground">
                  {selectedCustomer.address ? "Customer has a saved address." : "No saved addresses found."}
                </p>
                {selectedCustomer.address && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <p>{selectedCustomer.address.street}</p>
                    <p>{selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.pincode}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}