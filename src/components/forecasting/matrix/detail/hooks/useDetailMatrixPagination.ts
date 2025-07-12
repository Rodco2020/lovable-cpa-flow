import { useState, useMemo, useEffect } from 'react';

/**
 * Task interface for pagination
 */
interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
  monthlyDistribution?: Record<string, number>;
  totalHours?: number;
  recurringTaskId?: string;
  preferredStaffId?: string | null;
  preferredStaffName?: string;
}

interface UseDetailMatrixPaginationProps {
  /**
   * Array of tasks to paginate (usually filteredTasks for display)
   */
  tasks: Task[];
  /**
   * Initial rows per page
   */
  initialRowsPerPage?: number;
}

interface UseDetailMatrixPaginationResult {
  /**
   * Current page tasks for display
   */
  paginatedTasks: Task[];
  /**
   * Current page number (1-based)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Number of rows per page
   */
  rowsPerPage: number;
  /**
   * Start index for current page (0-based)
   */
  startIndex: number;
  /**
   * End index for current page (0-based)
   */
  endIndex: number;
  /**
   * Set current page number
   */
  setCurrentPage: (page: number) => void;
  /**
   * Set rows per page and reset to page 1
   */
  setRowsPerPage: (rows: number) => void;
  /**
   * Navigation helpers
   */
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  /**
   * State helpers
   */
  isFirstPage: boolean;
  isLastPage: boolean;
}

/**
 * Detail Matrix Pagination Hook - Phase 3 Extraction
 * 
 * Handles all pagination logic for the detail matrix:
 * - Manages current page and rows per page
 * - Calculates paginated task slice
 * - Provides navigation helpers
 * - Resets to page 1 when task data changes
 * - Optimized with memoization for performance
 */
export const useDetailMatrixPagination = ({
  tasks,
  initialRowsPerPage = 100
}: UseDetailMatrixPaginationProps): UseDetailMatrixPaginationResult => {
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPageState] = useState(initialRowsPerPage);

  // Calculate pagination values
  const totalPages = Math.ceil((tasks?.length || 0) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, tasks?.length || 0);

  // Memoize paginated tasks for performance
  const paginatedTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return [];
    }
    return tasks.slice(startIndex, endIndex);
  }, [tasks, startIndex, endIndex]);

  // Reset to page 1 when tasks change (e.g., filters applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks?.length]);

  // Navigation helpers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));

  // Enhanced setRowsPerPage that resets to page 1
  const setRowsPerPage = (rows: number) => {
    setRowsPerPageState(rows);
    setCurrentPage(1);
  };

  // Safe setCurrentPage with bounds checking
  const safeSetCurrentPage = (page: number) => {
    const safePage = Math.max(1, Math.min(totalPages || 1, page));
    setCurrentPage(safePage);
  };

  // State helpers
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return {
    paginatedTasks,
    currentPage,
    totalPages,
    rowsPerPage,
    startIndex,
    endIndex,
    setCurrentPage: safeSetCurrentPage,
    setRowsPerPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    isFirstPage,
    isLastPage
  };
};