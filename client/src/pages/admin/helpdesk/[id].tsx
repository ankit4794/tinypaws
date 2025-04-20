import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Send, Clock, User, MessageSquare, Loader2 } from 'lucide-react';

// Helpdesk Ticket type
type HelpdeskTicket = {
  _id: string;
  ticketId: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    userId?: string;
  };
  subject: string;
  message: string;
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: 'general' | 'sales' | 'support' | 'technical' | 'billing';
  assignedTo?: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  replies: Array<{
    message: string;
    sentBy: 'customer' | 'staff';
    staffId?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

const TicketDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [department, setDepartment] = useState<string>('');

  // Fetch ticket details
  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery<HelpdeskTicket>({
    queryKey: ['/api/admin/helpdesk', id],
    queryFn: async () => {
      if (!id) throw new Error('Ticket ID is required');
      const response = await apiRequest('GET', `/api/admin/helpdesk/${id}`);
      return response.json();
    },
    enabled: !!id,
  });

  // Set initial state values from ticket
  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setDepartment(ticket.department);
    }
  }, [ticket]);

  // Update ticket mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { status?: string; priority?: string; department?: string }) => {
      if (!id) throw new Error('Ticket ID is required');
      const response = await apiRequest('PUT', `/api/admin/helpdesk/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/helpdesk', id] });
      toast({
        title: 'Ticket updated',
        description: 'The ticket has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update the ticket.',
        variant: 'destructive',
      });
    },
  });

  // Add reply mutation
  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/admin/helpdesk/reply', {
        ticketId: id,
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/helpdesk', id] });
      setReplyMessage('');
      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reply.',
        variant: 'destructive',
      });
    },
  });

  // Handle reply submission
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyMessage.trim()) {
      replyMutation.mutate(replyMessage);
    }
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateMutation.mutate({ status: value });
  };

  // Handle priority change
  const handlePriorityChange = (value: string) => {
    setPriority(value);
    updateMutation.mutate({ priority: value });
  };

  // Handle department change
  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    updateMutation.mutate({ department: value });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if update is loading
  const isUpdating = updateMutation.isPending;

  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge class
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-green-100 text-green-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <p>Error loading ticket: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/helpdesk')}
          className="mt-2"
        >
          Back to Helpdesk
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Ticket ${ticket.ticketId} - TinyPaws Admin`}</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/helpdesk')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tickets
          </Button>
          <h1 className="text-2xl font-bold">Ticket Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{ticket.subject}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {formatDate(ticket.createdAt)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">{ticket.customer.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({ticket.customer.email})</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {ticket.message}
                </div>
              </CardContent>
            </Card>

            {/* Conversation */}
            {ticket.replies && ticket.replies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Conversation History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticket.replies.map((reply, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        reply.sentBy === 'staff' ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          reply.sentBy === 'staff'
                            ? 'bg-blue-50 rounded-tl-none'
                            : 'bg-gray-50 rounded-tr-none ml-auto'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {reply.sentBy === 'staff' ? 'Support Agent' : ticket.customer.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.timestamp)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Reply Form */}
            <Card>
              <CardHeader>
                <CardTitle>Reply to Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendReply} className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="Type your reply here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={replyMutation.isPending || !replyMessage.trim()}
                    >
                      {replyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Ticket ID</Label>
                  <p className="font-medium">{ticket.ticketId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Created</Label>
                  <p className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Last Updated</Label>
                  <p className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(ticket.updatedAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Total Messages</Label>
                  <p className="font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                    {ticket.replies.length + 1}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status" disabled={isUpdating}>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        status
                      )}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger id="priority" disabled={isUpdating}>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(
                        priority
                      )}`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={handleDepartmentChange}>
                    <SelectTrigger id="department" disabled={isUpdating}>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isUpdating && (
                  <div className="text-center text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                    Updating...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

TicketDetailPage.getLayout = (page: React.ReactNode) => {
  return <AdminLayout>{page}</AdminLayout>;
};

export default TicketDetailPage;