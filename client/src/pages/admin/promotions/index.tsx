import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminPromotions, useDeletePromotion, Promotion } from '@/hooks/admin/use-admin-promotions';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Loader2,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';

export default function PromotionsListPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data: promotions, 
    isLoading, 
    error, 
    isError 
  } = useAdminPromotions();
  
  const deletePromotion = useDeletePromotion();

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Promotion deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete promotion',
        variant: 'destructive',
      });
    }
  };

  const filteredPromotions = promotions?.length > 0 ? promotions?.filter((promotion) => 
    promotion.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    promotion.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const getPromotionTypeDisplay = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
        return <Badge variant="outline">Discount</Badge>;
      case 'FREE_SHIPPING':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Free Shipping</Badge>;
      case 'BOGO':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Buy One Get One</Badge>;
      case 'BUNDLE':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Bundle</Badge>;
      case 'COUPON':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Coupon</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatValue = (promotion: Promotion) => {
    if (promotion.isPercentage) {
      return `${promotion.value}%`;
    }
    return `₹${promotion.value}`;
  };

  const isActive = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    return promotion.isActive && startDate <= now && endDate >= now;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Promotions</h1>
          <Button 
            onClick={() => setLocation('/admin/promotions/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Promotion
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Promotions</CardTitle>
            <CardDescription>
              Create and manage promotion codes and discounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-destructive">
                <p>Error loading promotions. Please try again.</p>
              </div>
            ) : filteredPromotions?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No promotions found. Create your first promotion to get started.</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions?.map((promotion) => (
                      <TableRow key={promotion._id}>
                        <TableCell className="font-medium">{promotion.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {promotion.code}
                          </Badge>
                        </TableCell>
                        <TableCell>{getPromotionTypeDisplay(promotion.type)}</TableCell>
                        <TableCell>{formatValue(promotion)}</TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(promotion.startDate), 'MMM d, yyyy')} - 
                          {format(new Date(promotion.endDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {isActive(promotion) ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 flex items-center">
                              <Check className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 flex items-center">
                              <X className="h-3 w-3 mr-1" /> Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setLocation(`/admin/promotions/edit/${promotion._id}`)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                    <span className="text-destructive">Delete</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{promotion.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(promotion._id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}