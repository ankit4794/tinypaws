import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { InsertHelpDeskTicket, HelpDeskTicket, TicketStatus } from '@/shared/schema';

export interface TicketListResponse {
  tickets: HelpDeskTicket[];
  total: number;
}

export function useAdminTickets(page = 1, limit = 10) {
  // Fetch tickets
  const query = useQuery<TicketListResponse>({
    queryKey: ['/api/admin/tickets', page, limit],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/tickets?page=${page}&limit=${limit}`);
      return res.json();
    },
  });

  // Create ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticket: InsertHelpDeskTicket) => {
      const res = await apiRequest('POST', '/api/admin/tickets', ticket);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
    },
  });

  // Update ticket status
  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const res = await apiRequest('PATCH', `/api/admin/tickets/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
    },
  });

  // Assign ticket to staff
  const assignTicketMutation = useMutation({
    mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/tickets/${id}/assign`, { staffId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
    },
  });

  // Add ticket response
  const addTicketResponseMutation = useMutation({
    mutationFn: async ({ 
      ticketId, 
      message, 
      isStaff = true 
    }: { 
      ticketId: string; 
      message: string;
      isStaff?: boolean;
    }) => {
      const res = await apiRequest('POST', `/api/admin/tickets/${ticketId}/responses`, { 
        message,
        isStaff,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
    },
  });

  return {
    query,
    createTicketMutation,
    updateTicketStatusMutation,
    assignTicketMutation,
    addTicketResponseMutation,
  };
}