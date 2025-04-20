import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate array of page numbers to display
  const generatePagination = () => {
    // If there are 7 or fewer pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first and last page
    const firstPage = 1;
    const lastPage = totalPages;
    
    // Calculate middle pages based on current page
    const leftSiblingIndex = Math.max(currentPage - 1, firstPage);
    const rightSiblingIndex = Math.min(currentPage + 1, lastPage);
    
    // Calculate whether to show dots
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < lastPage - 1;
    
    // Generate array based on conditions
    if (shouldShowLeftDots && shouldShowRightDots) {
      // Show both left and right dots
      return [firstPage, 'DOTS_LEFT', leftSiblingIndex, currentPage, rightSiblingIndex, 'DOTS_RIGHT', lastPage];
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      // Show only left dots
      return [firstPage, 'DOTS_LEFT', lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    } else if (!shouldShowLeftDots && shouldShowRightDots) {
      // Show only right dots
      return [firstPage, firstPage + 1, firstPage + 2, firstPage + 3, 'DOTS_RIGHT', lastPage];
    }
    
    // Default case (unlikely with our logic, but just in case)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };
  
  const pagination = generatePagination();
  
  return (
    <div className="flex items-center justify-center space-x-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pagination.map((page, i) => {
        if (page === 'DOTS_LEFT' || page === 'DOTS_RIGHT') {
          return (
            <Button key={`${page}-${i}`} variant="outline" size="icon" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }
        
        const pageNum = page as number;
        return (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}