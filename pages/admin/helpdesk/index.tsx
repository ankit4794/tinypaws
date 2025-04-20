import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { MessageSquare, Search, Trash2, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { withAdminRoute } from '@/lib/protected-route';
import AdminLayout from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Helpdesk Ticket type
interface HelpdeskTicket {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
  };
  replies: Array<{
    _id: string;
    message: string;
    createdBy: {
      _id: string;
      username: string;
      email: string;
      fullName: string;
    };
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface TicketsResponse {
  tickets: HelpdeskTicket[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Form schema for reply
const replySchema = z.object({
  message: z.string().min(1, { message: 'Reply message is required' }),
});

const HelpdeskPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form for adding a reply
  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      message: '',
    },
  });

  // Get tickets data
  const {
    data: ticketsData,
    isLoading,
    error,
  } = useQuery<TicketsResponse>({
    queryKey: ['/api/admin/helpdesk', page, limit, status, priority, searchTerm],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      
      if (status) searchParams.append('status', status);
      if (priority) searchParams.append('priority', priority);
      if (searchTerm) searchParams.append('search', searchTerm);
      
      const res = await fetch(`/api/admin/helpdesk?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    }
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ 
      ticketId, 
      status, 
      priority,
      reply = null,
    }: { 
      ticketId: string; 
      status?: string; 
      priority?: string;
      reply?: { message: string } | null;
    }) => {
      const response = await apiRequest(
        'POST',
        '/api/admin/helpdesk',
        { ticketId, status, priority, reply }
      );
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/helpdesk'] });
      
      if (selectedTicket) {
        setSelectedTicket(data); // Update selected ticket with new data
      }
      
      toast({
        title: 'Ticket Updated',
        description: 'Ticket has been updated successfully',
      });
      
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update ticket',
        variant: 'destructive',
      });
    },
  });

  // Delete ticket mutation
  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiRequest(
        'DELETE',
        '/api/admin/helpdesk',
        { ticketId }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/helpdesk'] });
      
      if (viewDialogOpen) {
        setViewDialogOpen(false);
      }
      
      toast({
        title: 'Ticket Deleted',
        description: 'Ticket has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete ticket',
        variant: 'destructive',
      });
    },
  });

  // Handle submit for adding a reply
  const onReplySubmit = (data: z.infer<typeof replySchema>) => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        ticketId: selectedTicket._id,
        reply: { message: data.message }
      });
    }
  };

  // Handle update status
  const handleUpdateStatus = (ticketId: string, newStatus: string) => {
    updateTicketMutation.mutate({ ticketId, status: newStatus });
  };

  // Handle update priority
  const handleUpdatePriority = (ticketId: string, newPriority: string) => {
    updateTicketMutation.mutate({ ticketId, priority: newPriority });
  };

  // Handle delete ticket
  const handleDeleteTicket = (ticketId: string) => {
    deleteTicketMutation.mutate(ticketId);
  };

  // Handle view ticket details
  const handleViewTicket = (ticket: HelpdeskTicket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  // Pagination controls
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (ticketsData && page < ticketsData.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  // Status badge color and text
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Priority badge color and text
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="text-green-600 border-green-300">Low</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'urgent':
        return <Badge className="bg-red-500">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <>
      <Head>
        <title>Helpdesk Management | TinyPaws Admin</title>
      </Head>
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Helpdesk Tickets</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Tickets</CardTitle>
              <CardDescription>
                Use the filters below to find specific helpdesk tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Status
                  </label>
                  <Select
                    value={status}
                    onValueChange={setStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Priority
                  </label>
                  <Select
                    value={priority}
                    onValueChange={setPriority}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Items per page
                  </label>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => setLimit(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  setPage(1);
                  setSearchTerm('');
                  setStatus('');
                  setPriority('');
                }}
              >
                Reset Filters
              </Button>
            </CardFooter>
          </Card>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Failed to load tickets</h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error loading the helpdesk tickets. Please try again later.
                  </p>
                  <Button onClick={() => router.reload()}>Retry</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticketsData?.tickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No tickets found
                          </TableCell>
                        </TableRow>
                      ) : (
                        ticketsData?.tickets.map((ticket) => (
                          <TableRow key={ticket._id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto font-medium text-left"
                                  onClick={() => handleViewTicket(ticket)}
                                >
                                  {ticket.subject}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.name}</p>
                                <p className="text-sm text-muted-foreground">{ticket.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(ticket.status)}
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(ticket.priority)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2"
                                  onClick={() => handleViewTicket(ticket)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={deleteTicketMutation.isPending}
                                      className="h-8 px-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this helpdesk ticket.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteTicket(ticket._id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                {ticketsData && ticketsData.pagination.total > 0 && (
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1} to{" "}
                      {Math.min(page * limit, ticketsData.pagination.total)} of{" "}
                      {ticketsData.pagination.total} tickets
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrevPage}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous Page</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={page >= ticketsData.pagination.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next Page</span>
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </>
          )}

          {/* Ticket View Dialog */}
          {selectedTicket && (
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedTicket.subject}</DialogTitle>
                  <DialogDescription>
                    From: {selectedTicket.name} ({selectedTicket.email})
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="details" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Ticket Details</TabsTrigger>
                    <TabsTrigger value="replies">
                      Replies ({selectedTicket.replies.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4 pt-4">
                    <div className="flex flex-wrap gap-4 justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Status</p>
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(value) => handleUpdateStatus(selectedTicket._id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Priority</p>
                        <Select
                          value={selectedTicket.priority}
                          onValueChange={(value) => handleUpdatePriority(selectedTicket._id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Created</p>
                        <p className="text-sm">
                          {format(new Date(selectedTicket.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Message</p>
                      <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                        {selectedTicket.message}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="replies" className="space-y-4 pt-4">
                    {selectedTicket.replies.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No replies yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedTicket.replies.map((reply) => (
                          <div key={reply._id} className="p-4 bg-muted rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">
                                {reply.createdBy?.fullName || reply.createdBy?.username || 'Admin'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(reply.createdAt), 'MMM dd, yyyy HH:mm')}
                              </div>
                            </div>
                            <p className="whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="border-t pt-4 mt-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onReplySubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Add Reply</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Type your reply here..." 
                                    {...field} 
                                    rows={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit"
                            disabled={updateTicketMutation.isPending}
                          >
                            {updateTicketMutation.isPending ? 'Sending...' : 'Send Reply'}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="flex justify-between items-center gap-4 pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Ticket
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this helpdesk ticket and all its replies.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTicket(selectedTicket._id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button
                    variant="outline"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default withAdminRoute(HelpdeskPage);

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};