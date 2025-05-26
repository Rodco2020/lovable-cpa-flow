
/**
 * Mock components for client task component tests
 */

import React from 'react';

// Mock the EditRecurringTaskContainer component
export const MockEditRecurringTaskContainer = ({ open, onOpenChange, taskId, onSaveComplete }) => (
  <div data-testid="edit-task-dialog" data-open={open} data-task-id={taskId}>
    <button onClick={() => onOpenChange(false)}>Close</button>
    <button onClick={() => onSaveComplete && onSaveComplete()} data-testid="trigger-save-complete">
      Save Complete
    </button>
  </div>
);

// Mock the pagination component
export const MockTaskListPagination = ({ currentPage, totalPages, onPageChange }) => (
  <div data-testid="pagination">
    <button 
      onClick={() => onPageChange(currentPage > 1 ? currentPage - 1 : 1)}
      disabled={currentPage === 1}
      data-testid="prev-page"
    >
      Previous
    </button>
    <span data-testid="current-page">{currentPage}</span>
    <span data-testid="total-pages">of {totalPages}</span>
    <button 
      onClick={() => onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
      disabled={currentPage === totalPages}
      data-testid="next-page"
    >
      Next
    </button>
  </div>
);
