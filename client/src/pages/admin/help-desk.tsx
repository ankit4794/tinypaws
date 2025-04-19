import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter,
  Plus, 
  Inbox, 
  Clock, 
  CheckCircle, 
  XCircle,
  MessageSquare, 
  AlertCircle,
  ArrowUpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/use-auth';
import { useAdminTickets } from '@/hooks/admin';
import { TicketStatus, TicketPriority } from '@/shared/schema';

const statusColorMap = {
  [TicketStatus.OPEN]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
};

const priorityColorMap = {
  [TicketPriority.LOW]: 'bg-gray-100 text-gray-800',
  [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [TicketPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [TicketPriority.URGENT]: 'bg-red-100 text-red-800',
};

const priorityIconMap = {
  [TicketPriority.LOW]: null,
  [TicketPriority.MEDIUM]: <Clock className="h-4 w-4 mr-1" />,
  [TicketPriority.HIGH]: <AlertCircle className="h-4 w-4 mr-1" />,
  [TicketPriority.URGENT]: <ArrowUpCircle className="h-4 w-4 mr-1" />,
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const statusOptions = Object.values(TicketStatus).map(status => ({
  value: status,
  label: status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')
}));

const priorityOptions = Object.values(TicketPriority).map(priority => ({
  value: priority,
  label: priority.charAt(0) + priority.slice(1).toLowerCase()
}));

export default function HelpDeskPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Get tickets data from API
  const { query, updateTicketStatusMutation, addTicketResponseMutation } = useAdminTickets();
  const { data, isLoading } = query;

  const tickets = data?.tickets || [];

  const getFilteredTickets = () => {
    let filtered = tickets;
    
    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(ticket => ticket.status === selectedStatus);
    }
    
    // Filter by priority
    if (selectedPriority) {
      filtered = filtered.filter(ticket => ticket.priority === selectedPriority);
    }
    
    // Filter by search query (subject or message)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        ticket => 
          ticket.subject.toLowerCase().includes(query) || 
          ticket.message.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'open') {
        filtered = filtered.filter(ticket => ticket.status === TicketStatus.OPEN);
      } else if (activeTab === 'in-progress') {
        filtered = filtered.filter(ticket => ticket.status === TicketStatus.IN_PROGRESS);
      } else if (activeTab === 'resolved') {
        filtered = filtered.filter(
          ticket => ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED
        );
      }
    }
    
    return filtered;
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await updateTicketStatusMutation.mutateAsync({
        id: ticketId,
        status: newStatus,
      });
      
      toast({
        title: 'Status Updated',
        description: `Ticket status changed to ${newStatus.toLowerCase().replace('_', ' ')}`,
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update ticket status: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      toast({
        title: 'Error',
        description: 'Response cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addTicketResponseMutation.mutateAsync({
        ticketId: selectedTicket.id,
        message: responseText,
        isStaff: true,
      });
      
      setResponseText('');
      setIsResponseDialogOpen(false);
      
      toast({
        title: 'Response Added',
        description: 'Your response has been added to the ticket',
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to add response: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Help Desk Management</h1>
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Create Ticket
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by priority" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="flex items-center">
                  <Inbox className="h-4 w-4 mr-1" /> All Tickets
                </TabsTrigger>
                <TabsTrigger value="open" className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> Open
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> In Progress
                </TabsTrigger>
                <TabsTrigger value="resolved" className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Resolved
                </TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredTickets().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No tickets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredTickets().map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-mono">{ticket.id.slice(0, 8)}</TableCell>
                          <TableCell className="font-medium">
                            <div className="truncate max-w-[250px]" title={ticket.subject}>
                              {ticket.subject}
                            </div>
                          </TableCell>
                          <TableCell>{ticket.user.username}</TableCell>
                          <TableCell>
                            <Badge className={statusColorMap[ticket.status]}>
                              {ticket.status.charAt(0) + ticket.status.slice(1).toLowerCase().replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Badge className={priorityColorMap[ticket.priority]}>
                                {priorityIconMap[ticket.priority]}
                                {ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewTicket(ticket)}
                              >
                                View
                              </Button>
                              
                              <Select 
                                defaultValue={ticket.status}
                                onValueChange={(value) => handleStatusChange(ticket.id, value as TicketStatus)}
                              >
                                <SelectTrigger className="h-8 w-[130px]">
                                  <SelectValue placeholder="Change Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Ticket View Dialog */}
        {selectedTicket && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Ticket #{selectedTicket.id.slice(0, 8)}</DialogTitle>
                <DialogDescription>
                  Opened on {formatDate(selectedTicket.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium mb-1">Status</div>
                  <Badge className={statusColorMap[selectedTicket.status]}>
                    {selectedTicket.status.charAt(0) + selectedTicket.status.slice(1).toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Priority</div>
                  <Badge className={priorityColorMap[selectedTicket.priority]}>
                    {selectedTicket.priority.charAt(0) + selectedTicket.priority.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Customer</div>
                  <div>{selectedTicket.user.username}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{selectedTicket.subject}</h3>
                <div className="p-3 bg-muted rounded-md">
                  {selectedTicket.message}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-semibold">Responses</h3>
                  <Button 
                    size="sm" 
                    onClick={() => setIsResponseDialogOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Add Response
                  </Button>
                </div>
                
                {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTicket.responses.map((response) => (
                      <div key={response.id} className={`p-3 rounded-md ${response.isStaff ? 'bg-blue-50 ml-4' : 'bg-muted mr-4'}`}>
                        <div className="flex justify-between mb-1">
                          <div className="text-sm font-medium">
                            {response.isStaff ? 'Support Staff' : 'Customer'} - {response.user.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(response.createdAt)}
                          </div>
                        </div>
                        <div className="text-sm">{response.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    No responses yet
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                  <Select 
                    defaultValue={selectedTicket.status}
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value as TicketStatus)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Add Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Response</DialogTitle>
              <DialogDescription>
                Write a response to the customer's ticket
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="response">Response</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response here..."
                  rows={5}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddResponse}>
                Submit Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}