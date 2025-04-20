import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, MessageSquare, User, Send, Check, X, Clock } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { withAdminProtectedRoute } from '@/lib/admin-protected-route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Define schema for reply form
const replySchema = z.object({
  message: z.string().min(2, { message: 'Message must be at least 2 characters' }),
});

type ReplyFormValues = z.infer<typeof replySchema>;

function HelpdeskPage() {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = React.useState<string | null>(null);
  
  // Reply form
  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      message: '',
    },
  });

  // Query to fetch support tickets
  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['/api/admin/helpdesk/tickets'],
    retry: 1,
  });

  // Query to fetch selected ticket details
  const { data: ticketDetails, isLoading: isLoadingTicketDetails } = useQuery({
    queryKey: ['/api/admin/helpdesk/tickets', selectedTicket],
    enabled: !!selectedTicket,
    retry: 1,
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/helpdesk/tickets/${ticketId}/status`, { status })
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Ticket status updated',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/helpdesk/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/helpdesk/tickets', selectedTicket] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reply to ticket mutation
  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      return apiRequest('POST', `/api/admin/helpdesk/tickets/${ticketId}/reply`, { message })
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Reply sent successfully',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/helpdesk/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/helpdesk/tickets', selectedTicket] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle status change
  const handleStatusChange = (status: string) => {
    if (selectedTicket) {
      updateStatusMutation.mutate({ ticketId: selectedTicket, status });
    }
  };

  // Handle reply form submission
  const onReplySubmit = (data: ReplyFormValues) => {
    if (selectedTicket) {
      replyMutation.mutate({ ticketId: selectedTicket, message: data.message });
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Helpdesk</h1>
        <p className="text-muted-foreground">Manage support tickets and customer inquiries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="md:col-span-1">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>View and manage customer tickets</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingTickets ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tickets?.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-18rem)]">
                  <div className="px-4">
                    {tickets.map((ticket: any) => (
                      <div key={ticket._id} className="mb-2">
                        <button
                          className={`w-full text-left p-3 rounded-md hover:bg-muted transition-colors ${
                            selectedTicket === ticket._id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedTicket(ticket._id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium truncate">{ticket.subject}</div>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mb-1 flex items-center">
                            <User className="h-3 w-3 mr-1" /> {ticket.user.fullName || ticket.user.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(ticket.createdAt), 'dd MMM yyyy, HH:mm')}
                          </div>
                        </button>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground px-4">
                  No support tickets found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)] flex flex-col">
            {selectedTicket ? (
              isLoadingTicketDetails ? (
                <div className="flex-1 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : ticketDetails ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{ticketDetails.subject}</CardTitle>
                        <CardDescription>
                          Ticket #{ticketDetails.ticketId} • Opened by{' '}
                          {ticketDetails.user.fullName || ticketDetails.user.email}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          defaultValue={ticketDetails.status}
                          onValueChange={handleStatusChange}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-[calc(100%-4rem)]">
                      <div className="space-y-6 pb-6">
                        {ticketDetails.messages.map((message: any) => (
                          <div 
                            key={message._id} 
                            className={`flex gap-4 ${
                              message.isAdmin ? 'justify-end' : ''
                            }`}
                          >
                            {!message.isAdmin && (
                              <Avatar>
                                <AvatarFallback>
                                  {ticketDetails.user.fullName?.[0] || ticketDetails.user.email?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[80%] ${message.isAdmin ? 'order-1' : 'order-2'}`}>
                              <div 
                                className={`rounded-lg p-4 ${
                                  message.isAdmin 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <div 
                                className={`text-xs mt-1 flex gap-1 items-center ${
                                  message.isAdmin ? 'justify-end text-muted-foreground' : 'text-muted-foreground'
                                }`}
                              >
                                {format(new Date(message.createdAt), 'dd MMM, HH:mm')}
                                {message.isAdmin && message.read && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                            {message.isAdmin && (
                              <Avatar>
                                <AvatarFallback>A</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-card">
                    <Form {...form}>
                      <form 
                        onSubmit={form.handleSubmit(onReplySubmit)} 
                        className="flex w-full gap-2"
                      >
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Textarea
                                  placeholder="Type your reply here..."
                                  className="min-h-10 resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit"
                          disabled={replyMutation.isPending}
                        >
                          {replyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardFooter>
                </>
              ) : (
                <div className="flex-1 flex justify-center items-center text-muted-foreground">
                  Failed to load ticket details. Please try again.
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground p-4 text-center">
                <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-1">No Ticket Selected</h3>
                <p>Select a ticket from the list to view details and reply</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAdminProtectedRoute(HelpdeskPage);