import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { PromotionType } from '@shared/schema';
import { 
  Promotion, 
  CreatePromotionPayload, 
  UpdatePromotionPayload 
} from '@/hooks/admin/use-admin-promotions';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  type: z.string(), // Using PromotionType enum values
  value: z.coerce.number().positive("Value must be positive"),
  isPercentage: z.boolean().default(true),
  minOrderValue: z.coerce.number().nonnegative("Minimum order value cannot be negative"),
  maxDiscount: z.coerce.number().positive("Maximum discount must be positive").optional(),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.coerce.number().positive("Usage limit must be positive").optional(),
  perUserLimit: z.coerce.number().positive("Per user limit must be positive"),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface PromotionFormProps {
  promotion?: Promotion;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function PromotionForm({ promotion, onSubmit, isSubmitting }: PromotionFormProps) {
  // Initialize form with default values or existing promotion data
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: promotion?.name || '',
      code: promotion?.code || '',
      type: promotion?.type || PromotionType.DISCOUNT,
      value: promotion?.value || 0,
      isPercentage: promotion?.isPercentage ?? true,
      minOrderValue: promotion?.minOrderValue || 0,
      maxDiscount: promotion?.maxDiscount,
      startDate: promotion?.startDate 
        ? format(new Date(promotion.startDate), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      endDate: promotion?.endDate
        ? format(new Date(promotion.endDate), 'yyyy-MM-dd')
        : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      usageLimit: promotion?.usageLimit,
      perUserLimit: promotion?.perUserLimit || 1,
      isActive: promotion?.isActive ?? true,
    }
  });

  const handleSubmit = (values: FormData) => {
    if (promotion) {
      // Update existing promotion
      onSubmit({
        id: promotion._id,
        data: values,
      });
    } else {
      // Create new promotion
      onSubmit(values as CreatePromotionPayload);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Summer Sale" {...field} />
                </FormControl>
                <FormDescription>
                  Internal name for this promotion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="SUMMER20" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>
                  Promotion code for customers to apply.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select promotion type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PromotionType.DISCOUNT}>Discount</SelectItem>
                      <SelectItem value={PromotionType.FREE_SHIPPING}>Free Shipping</SelectItem>
                      <SelectItem value={PromotionType.BOGO}>Buy One Get One</SelectItem>
                      <SelectItem value={PromotionType.BUNDLE}>Bundle</SelectItem>
                      <SelectItem value={PromotionType.COUPON}>Coupon</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  The type of promotion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Amount or percentage.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPercentage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between mt-8 space-x-3 space-y-0">
                  <FormLabel>Is Percentage?</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="minOrderValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Order Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Minimum cart value for the promotion to apply.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Discount (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Maximum discount amount for percentage discounts.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="usageLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Usage Limit (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of times this promotion can be used.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="perUserLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Per User Limit</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Maximum times a single user can use this promotion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Enable this promotion to make it available for customers
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Promotion'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}