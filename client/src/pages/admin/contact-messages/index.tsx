import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Trash, Loader2, Mail, Eye, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AdminLayout } from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContactMessagesPage() {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Query to fetch contact messages
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery<ContactMessage[]>({
    queryKey: ['/api/admin/contact-messages'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/contact-messages');
      return response.json();
    },
    retry: 1,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('PATCH', `/api/admin/contact-messages/${id}/read`, {})
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] });
      toast({
        title: 'Success',
        description: 'Message marked as read',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/contact-messages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] });
      setIsDeleteDialogOpen(false);
      setMessageToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // Handle view message
  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    
    // If message is unread, mark it as read
    if (!message.read) {
      markAsReadMutation.mutate(message._id);
    }
  };

  // Handle delete message
  const handleDeleteMessage = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: string) => {
    setMessageToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Close view dialog
  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setTimeout(() => setSelectedMessage(null), 300);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Contact Messages</h1>
            <p className="text-muted-foreground">Manage customer inquiries and messages</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Messages</CardTitle>
            <CardDescription>View and respond to customer messages</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load messages</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  There was an error loading the contact messages. Please try again later.
                </p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] })}
                >
                  Retry
                </Button>
              </div>
            ) : messages.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message._id} className={message.read ? '' : 'bg-muted/50'}>
                      <TableCell>
                        <Badge variant={message.read ? 'outline' : 'default'}>
                          {message.read ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>{message.subject || 'N/A'}</TableCell>
                      <TableCell>
                        {message.createdAt
                          ? format(new Date(message.createdAt), 'dd MMM yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(message._id)}
                            disabled={deleteMutation.isPending}
                            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 px-4">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                <p className="text-muted-foreground">
                  When customers submit contact forms, they will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Message Dialog */}
        {selectedMessage && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {selectedMessage.subject || 'Contact Message'}
                </DialogTitle>
                <DialogDescription>
                  From: {selectedMessage.name} ({selectedMessage.email})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Name:</p>
                    <p>{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <p className="font-semibold">Phone:</p>
                      <p>{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">Date:</p>
                    <p>
                      {selectedMessage.createdAt
                        ? format(
                            new Date(selectedMessage.createdAt),
                            'dd MMM yyyy, HH:mm'
                          )
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="font-semibold mb-2">Message:</p>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseViewDialog}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${
                      selectedMessage.subject || 'Your message to TinyPaws'
                    }`;
                  }}
                >
                  Reply via Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the message from your database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)} 
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}