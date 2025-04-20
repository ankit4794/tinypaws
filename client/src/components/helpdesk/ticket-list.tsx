import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Filter, Eye, Search } from 'lucide-react';
import { getQueryFn } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export interface Ticket {
  _id: string;
  subject: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketListResponse {
  tickets: Ticket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TicketListProps {
  onSelectTicket?: (ticketId: string) => void;
  className?: string;
}

export function TicketList({ onSelectTicket, className = '' }: TicketListProps) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading, error } = useQuery<TicketListResponse>({
    queryKey: ['/api/helpdesk/tickets', { page, filter, search: searchQuery }],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled by the query params already
  };

  const getStatusBadgeColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'pending':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'closed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getPriorityBadgeColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'medium':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Failed to load tickets.</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!data?.tickets.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-2">No tickets found.</p>
        <p className="text-sm text-gray-400">
          {searchQuery || filter !== 'all' 
            ? 'Try adjusting your filters or search query.' 
            : 'Create a new ticket to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search tickets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select 
            value={filter} 
            onValueChange={(value) => setFilter(value as any)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[46%]">Subject</TableHead>
              <TableHead className="w-[18%]">Status</TableHead>
              <TableHead className="w-[18%]">Priority</TableHead>
              <TableHead className="w-[18%] text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tickets.map((ticket) => (
              <TableRow 
                key={ticket._id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelectTicket?.(ticket._id)}
              >
                <TableCell className="font-medium">
                  {ticket.subject}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeColor(ticket.status)}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPriorityBadgeColor(ticket.priority)}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-gray-600 text-sm">
                  {formatDateTime(ticket.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {data.pagination.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(Math.max(1, page - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {/* Show up to 5 page links */}
            {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
              // If there are more than 5 pages, show ellipsis logic
              let pageNum = i + 1;
              
              if (data.pagination.totalPages > 5) {
                if (page <= 3) {
                  // We're at the start
                  pageNum = i + 1;
                } else if (page >= data.pagination.totalPages - 2) {
                  // We're at the end
                  pageNum = data.pagination.totalPages - 4 + i;
                } else {
                  // We're in the middle
                  pageNum = page - 2 + i;
                }
              }
              
              return (
                <PaginationItem key={`page-${pageNum}`}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                className={page === data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}