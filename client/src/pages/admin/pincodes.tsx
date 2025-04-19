import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/use-auth';
import { useAdminPincodes } from '@/hooks/admin';
import { insertServiceablePincodeSchema, InsertServiceablePincode } from '@/shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const defaultFormValues: InsertServiceablePincode = {
  pincode: '',
  city: '',
  state: '',
  deliveryDays: 3,
  isActive: true,
  codAvailable: true,
};

export default function PincodesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [checkPincodeQuery, setCheckPincodeQuery] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const { toast } = useToast();
  
  const limit = 10;
  
  // Get pincodes from API
  const { 
    query, 
    createPincodeMutation, 
    updatePincodeMutation, 
    deletePincodeMutation,
    checkPincodeMutation
  } = useAdminPincodes(currentPage, limit);
  
  const { data, isLoading } = query;
  const pincodes = data?.pincodes || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  // Create form
  const createForm = useForm<InsertServiceablePincode>({
    resolver: zodResolver(insertServiceablePincodeSchema),
    defaultValues: defaultFormValues,
  });
  
  // Edit form
  const editForm = useForm<InsertServiceablePincode & { id: string }>({
    resolver: zodResolver(insertServiceablePincodeSchema.extend({ id: insertServiceablePincodeSchema.shape.pincode })),
    defaultValues: { ...defaultFormValues, id: '' },
  });
  
  // Filter by search query
  const getFilteredPincodes = () => {
    if (!searchQuery) return pincodes;
    
    const query = searchQuery.toLowerCase();
    return pincodes.filter(
      pincode => 
        pincode.pincode.toLowerCase().includes(query) || 
        (pincode.city && pincode.city.toLowerCase().includes(query)) || 
        (pincode.state && pincode.state.toLowerCase().includes(query))
    );
  };
  
  // Handle create pincode
  const handleCreatePincode = async (values: InsertServiceablePincode) => {
    try {
      await createPincodeMutation.mutateAsync(values);
      
      toast({
        title: 'Pincode Created',
        description: `Pincode ${values.pincode} has been created successfully`,
      });
      
      createForm.reset(defaultFormValues);
      setIsCreateDialogOpen(false);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create pincode: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  // Handle edit pincode
  const handleEditPincode = async (values: InsertServiceablePincode & { id: string }) => {
    try {
      const { id, ...pincodeData } = values;
      
      await updatePincodeMutation.mutateAsync({
        id,
        ...pincodeData,
      });
      
      toast({
        title: 'Pincode Updated',
        description: `Pincode ${values.pincode} has been updated successfully`,
      });
      
      setIsEditDialogOpen(false);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update pincode: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete pincode
  const handleDeletePincode = async () => {
    try {
      await deletePincodeMutation.mutateAsync(selectedPincode.id);
      
      toast({
        title: 'Pincode Deleted',
        description: `Pincode ${selectedPincode.pincode} has been deleted successfully`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedPincode(null);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete pincode: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  // Handle check pincode
  const handleCheckPincode = async () => {
    if (!checkPincodeQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a pincode to check',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCheckingPincode(true);
    
    try {
      const result = await checkPincodeMutation.mutateAsync(checkPincodeQuery);
      setCheckResult(result);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to check pincode: ${error.message}`,
        variant: 'destructive',
      });
      setCheckResult(null);
    } finally {
      setIsCheckingPincode(false);
    }
  };
  
  // Pagination handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Serviceable Pincode Management</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Pincode
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pincode Checker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter pincode to check..."
                  value={checkPincodeQuery}
                  onChange={(e) => setCheckPincodeQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button 
                onClick={handleCheckPincode} 
                disabled={isCheckingPincode}
              >
                {isCheckingPincode ? 'Checking...' : 'Check'}
              </Button>
            </div>
            
            {checkResult && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Check Result:</h3>
                {checkResult.isServiceable ? (
                  <div>
                    <div className="flex items-center text-green-600 mb-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>This pincode is serviceable</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p>{checkResult.city}, {checkResult.state}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Time</p>
                        <p>{checkResult.deliveryDays} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cash on Delivery</p>
                        <p>{checkResult.codAvailable ? 'Available' : 'Not Available'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span>This pincode is not serviceable</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search pincodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pincode</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Delivery (Days)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>COD</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredPincodes().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No pincodes found
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredPincodes().map((pincode) => (
                          <TableRow key={pincode.id}>
                            <TableCell className="font-medium">{pincode.pincode}</TableCell>
                            <TableCell>{pincode.city || '-'}</TableCell>
                            <TableCell>{pincode.state || '-'}</TableCell>
                            <TableCell>{pincode.deliveryDays}</TableCell>
                            <TableCell>
                              <Badge className={pincode.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {pincode.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={pincode.codAvailable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                                {pincode.codAvailable ? 'Available' : 'Unavailable'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPincode(pincode);
                                    editForm.reset({
                                      id: pincode.id,
                                      pincode: pincode.pincode,
                                      city: pincode.city || '',
                                      state: pincode.state || '',
                                      deliveryDays: pincode.deliveryDays,
                                      isActive: pincode.isActive,
                                      codAvailable: pincode.codAvailable,
                                    });
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedPincode(pincode);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Create Pincode Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Pincode</DialogTitle>
              <DialogDescription>
                Add a new serviceable pincode to your delivery areas
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreatePincode)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 400001" {...field} />
                      </FormControl>
                      <FormDescription>Enter the delivery pincode</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Mumbai" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Maharashtra" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createForm.control}
                  name="deliveryDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Days</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>Estimated days for delivery to this pincode</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Is this pincode active for delivery?
                          </FormDescription>
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
                    control={createForm.control}
                    name="codAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Cash on Delivery</FormLabel>
                          <FormDescription>
                            Is COD available for this pincode?
                          </FormDescription>
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
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createPincodeMutation.isPending}
                  >
                    {createPincodeMutation.isPending ? 'Saving...' : 'Save Pincode'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Pincode Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pincode</DialogTitle>
              <DialogDescription>
                Update the delivery information for this pincode
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditPincode)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 400001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Mumbai" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Maharashtra" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="deliveryDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Days</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>Estimated days for delivery to this pincode</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Is this pincode active for delivery?
                          </FormDescription>
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
                    control={editForm.control}
                    name="codAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Cash on Delivery</FormLabel>
                          <FormDescription>
                            Is COD available for this pincode?
                          </FormDescription>
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
                
                <input type="hidden" {...editForm.register('id')} />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updatePincodeMutation.isPending}
                  >
                    {updatePincodeMutation.isPending ? 'Updating...' : 'Update Pincode'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Pincode</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this pincode? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedPincode && (
              <div className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 text-red-700 p-3 rounded-full">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pincode: {selectedPincode.pincode}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPincode.city && selectedPincode.state
                        ? `${selectedPincode.city}, ${selectedPincode.state}`
                        : 'No location data'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeletePincode}
                disabled={deletePincodeMutation.isPending}
              >
                {deletePincodeMutation.isPending ? 'Deleting...' : 'Delete Pincode'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}