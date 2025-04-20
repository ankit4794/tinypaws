import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, MailCheck, Send, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

const subscribeSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().optional(),
});

type SubscribeFormValues = z.infer<typeof subscribeSchema>;

type SubscribeFormProps = {
  variant?: 'inline' | 'stacked';
  className?: string;
  onSuccess?: () => void;
  showNameField?: boolean;
};

export function NewsletterSubscribeForm({ 
  variant = 'inline', 
  className = '',
  onSuccess,
  showNameField = false,
}: SubscribeFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SubscribeFormValues) => {
      const response = await apiRequest('POST', '/api/newsletter/subscribe', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Subscription successful',
        description: 'Thank you for subscribing to our newsletter!',
      });
      form.reset();
      setSubmitted(true);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Subscription failed',
        description: error.message || 'Failed to subscribe to newsletter. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: SubscribeFormValues) => {
    mutation.mutate(data);
  };

  const resetForm = () => {
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Alert className={`bg-green-50 border-green-200 ${className}`}>
        <MailCheck className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between text-green-700">
          <span>Thanks for subscribing! We'll keep you updated.</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetForm} 
            className="text-green-700 hover:text-green-900 hover:bg-green-100 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`${className}`}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
            {showNameField && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="bg-black hover:bg-gray-800" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Subscribe</>
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {showNameField && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormDescription>
                  We'll never share your email with anyone else.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-gray-800"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Subscribe to Newsletter
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}