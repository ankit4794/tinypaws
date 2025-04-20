import React from 'react';
import { useLocation, useParams } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  usePromotion, 
  useUpdatePromotion, 
  UpdatePromotionPayload 
} from '@/hooks/admin/use-admin-promotions';
import AdminLayout from '@/components/layout/AdminLayout';
import { PromotionForm } from '@/components/admin/promotion-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';

export default function EditPromotionPage() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: promotion, isLoading, error } = usePromotion(id);
  const updatePromotion = useUpdatePromotion();
  
  const handleSubmit = async (data: any) => {
    try {
      await updatePromotion.mutateAsync({
        id,
        data
      });
      toast({
        title: 'Success',
        description: 'Promotion updated successfully',
      });
      setLocation('/admin/promotions');
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to update promotion',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !promotion) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-destructive">
          <h2 className="text-xl font-semibold mb-2">Error Loading Promotion</h2>
          <p>Unable to load promotion details. Please try again later.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation('/admin/promotions')}
          >
            Back to Promotions
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Promotion</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/admin/promotions')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Promotions
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit {promotion.name}</CardTitle>
            <CardDescription>
              Modify an existing promotion details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromotionForm 
              promotion={promotion}
              onSubmit={handleSubmit}
              isSubmitting={updatePromotion.isPending} 
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}