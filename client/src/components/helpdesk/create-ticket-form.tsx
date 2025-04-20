import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const ticketSchema = z.object({
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a priority level',
  }),
  type: z.string().min(1, { message: 'Please select a ticket type' }),
  orderId: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

type CreateTicketFormProps = {
  className?: string;
  onTicketCreated?: (ticketId: string) => void;
  compact?: boolean;
};

export function CreateTicketForm({ 
  className = '', 
  onTicketCreated,
  compact = false 
}: CreateTicketFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      message: '',
      priority: 'medium',
      type: 'inquiry',
      orderId: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TicketFormValues) => {
      const response = await apiRequest('POST', '/api/helpdesk/tickets', data);
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been submitted successfully.',
        variant: 'default',
      });
      form.reset();
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/helpdesk/tickets'] });
      
      if (onTicketCreated && data._id) {
        onTicketCreated(data._id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create ticket. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TicketFormValues) => {
    createMutation.mutate(data);
  };

  if (submitted && !compact) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4 bg-green-50 text-green-800 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Ticket Submitted Successfully!</h3>
          <p className="mt-2">
            Thank you for contacting us. Our support team will get back to you as soon as possible.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSubmitted(false)}
        >
          Create Another Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Brief description of your issue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Type <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inquiry">General Inquiry</SelectItem>
                      <SelectItem value="order">Order Issue</SelectItem>
                      <SelectItem value="product">Product Question</SelectItem>
                      <SelectItem value="return">Return/Exchange</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="orderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order ID (if applicable)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your order ID" {...field} />
                </FormControl>
                <FormDescription>
                  If your issue is related to an order, please provide the order ID for faster assistance.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please describe your issue in detail" 
                    className="min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-gray-800"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Ticket
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}