import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Pencil, Trash, PlusCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Schema for pincode form
const pincodeSchema = z.object({
  pincode: z.string().min(6, "Pincode must be at least 6 characters").max(6, "Pincode cannot exceed 6 characters"),
  city: z.string().min(2, "City name is required"),
  state: z.string().min(2, "State name is required"),
  deliveryDays: z.number().min(1, "Must be at least 1 day").max(15, "Must not exceed 15 days"),
  isActive: z.boolean().default(true),
  codAvailable: z.boolean().default(true),
});

type PincodeFormValues = z.infer<typeof pincodeSchema>;

export default function PincodesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch pincodes
  const { data: pincodes, isLoading } = useQuery({
    queryKey: ["/api/admin/pincodes"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/pincodes");
      return await res.json();
    },
  });

  // Add pincode mutation
  const addPincodeMutation = useMutation({
    mutationFn: async (data: PincodeFormValues) => {
      const res = await apiRequest("POST", "/api/admin/pincodes", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pincode added successfully",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pincodes"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add pincode",
        variant: "destructive",
      });
    },
  });

  // Update pincode mutation
  const updatePincodeMutation = useMutation({
    mutationFn: async (data: PincodeFormValues & { _id: string }) => {
      const { _id, ...rest } = data;
      const res = await apiRequest("PATCH", `/api/admin/pincodes/${_id}`, rest);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pincode updated successfully",
      });
      setSelectedPincode(null);
      setIsEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pincodes"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pincode",
        variant: "destructive",
      });
    },
  });

  // Delete pincode mutation
  const deletePincodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/pincodes/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pincode deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pincodes"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pincode",
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing a pincode
  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      city: "",
      state: "",
      deliveryDays: 3,
      isActive: true,
      codAvailable: true,
    },
  });

  // Reset form and set default values when opening add dialog
  const openAddDialog = () => {
    form.reset({
      pincode: "",
      city: "",
      state: "",
      deliveryDays: 3,
      isActive: true,
      codAvailable: true,
    });
    setIsAddDialogOpen(true);
    setIsEditMode(false);
  };

  // Set form values when editing a pincode
  const openEditDialog = (pincode) => {
    form.reset({
      pincode: pincode.pincode,
      city: pincode.city,
      state: pincode.state,
      deliveryDays: pincode.deliveryDays,
      isActive: pincode.isActive,
      codAvailable: pincode.codAvailable,
    });
    setSelectedPincode(pincode);
    setIsEditMode(true);
  };

  // Handle form submission
  const onSubmit = (data: PincodeFormValues) => {
    if (isEditMode && selectedPincode) {
      updatePincodeMutation.mutate({
        _id: selectedPincode._id,
        ...data,
      });
    } else {
      addPincodeMutation.mutate(data);
    }
  };

  // Handle delete confirmation
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this pincode?")) {
      deletePincodeMutation.mutate(id);
    }
  };

  // Filter pincodes based on search query
  const filteredPincodes = pincodes ? pincodes.filter(p => 
    p.pincode.includes(searchQuery) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.state.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Serviceable Pincodes</CardTitle>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pincode
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by pincode, city or state..."
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
                    <TableHead>Pincode</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Delivery (Days)</TableHead>
                    <TableHead>COD</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPincodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No pincodes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPincodes.map((pincode) => (
                      <TableRow key={pincode._id}>
                        <TableCell className="font-medium">{pincode.pincode}</TableCell>
                        <TableCell>{pincode.city}</TableCell>
                        <TableCell>{pincode.state}</TableCell>
                        <TableCell>{pincode.deliveryDays}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch
                              checked={pincode.codAvailable}
                              onCheckedChange={(checked) => {
                                updatePincodeMutation.mutate({
                                  _id: pincode._id,
                                  ...pincode,
                                  codAvailable: checked
                                });
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch
                              checked={pincode.isActive}
                              onCheckedChange={(checked) => {
                                updatePincodeMutation.mutate({
                                  _id: pincode._id,
                                  ...pincode,
                                  isActive: checked
                                });
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(pincode)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(pincode._id)}
                            >
                              <Trash className="h-4 w-4" />
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

      {/* Add/Edit Pincode Dialog */}
      <Dialog 
        open={isAddDialogOpen || isEditMode} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setSelectedPincode(null);
            setIsEditMode(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Pincode" : "Add New Pincode"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the delivery pincode details." 
                : "Add a new serviceable pincode area."
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        {...field}
                        disabled={isEditMode} // Can't change pincode in edit mode
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="City name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input placeholder="State name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="deliveryDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Days *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        max={15}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="codAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Cash on Delivery</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedPincode(null);
                    setIsEditMode(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addPincodeMutation.isPending || updatePincodeMutation.isPending}
                >
                  {(addPincodeMutation.isPending || updatePincodeMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    isEditMode ? "Update Pincode" : "Add Pincode"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}