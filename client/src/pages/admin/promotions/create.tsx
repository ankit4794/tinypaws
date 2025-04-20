import React from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useCreatePromotion, CreatePromotionPayload } from '@/hooks/admin/use-admin-promotions';
import AdminLayout from '@/components/layout/AdminLayout';
import { PromotionForm } from '@/components/admin/promotion-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export default function CreatePromotionPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const createPromotion = useCreatePromotion();
  
  const handleSubmit = async (data: CreatePromotionPayload) => {
    try {
      await createPromotion.mutateAsync(data);
      toast({
        title: 'Success',
        description: 'Promotion created successfully',
      });
      setLocation('/admin/promotions');
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to create promotion',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create Promotion</h1>
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
            <CardTitle>New Promotion</CardTitle>
            <CardDescription>
              Create a new promotion code for discounts, special offers, or free shipping.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromotionForm 
              onSubmit={handleSubmit}
              isSubmitting={createPromotion.isPending} 
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}