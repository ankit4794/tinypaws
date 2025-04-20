import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Trash2, Loader2, Mail, Eye } from 'lucide-react';
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

function ContactMessagesPage() {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = React.useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

  // Query to fetch contact messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/admin/contact-messages'],
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
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle view message
  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    
    // If message is unread, mark it as read
    if (!message.read) {
      markAsReadMutation.mutate(message._id);
    }
  };

  // Handle delete message
  const handleDeleteMessage = (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
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
          ) : messages?.length > 0 ? (
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
                {messages.map((message: any) => (
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
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMessage(message._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No contact messages found.
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
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                onClick={() => setIsViewDialogOpen(false)}
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
    </div>
  );
}

export default withAdminProtectedRoute(ContactMessagesPage);