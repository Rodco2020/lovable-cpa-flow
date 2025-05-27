/**
 * Progress Tracker Utilities
 * 
 * Utilities for tracking and managing operation progress.
 */

export interface OperationProgress {
  completed: number;
  total: number;
  percentage: number;
  currentOperation?: string;
  estimatedTimeRemaining?: number;
  operations?: Array<{
    id: string;
    description: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
  }>;
  errors?: string[];
}

export interface OperationResults {
  success: boolean;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  errors: string[];
  processingTime: number;
  results: any[];
  tasksCreated?: number; // Add this property to match UI expectations
}

export const createInitialProgress = (total: number = 0): OperationProgress => ({
  completed: 0,
  total,
  percentage: 0,
  operations: [],
  errors: []
});

export const createInitialResults = (): OperationResults => ({
  success: false,
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  errors: [],
  processingTime: 0,
  results: []
});

export const updateProgress = (
  current: OperationProgress,
  updates: Partial<OperationProgress>
): OperationProgress => ({
  ...current,
  ...updates,
  percentage: updates.total ? (updates.completed || current.completed) / updates.total * 100 : current.percentage
});

export const addOperationToProgress = (
  current: OperationProgress,
  operation: {
    id: string;
    description: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
  }
): OperationProgress => ({
  ...current,
  operations: [
    ...(current.operations || []),
    operation
  ]
});

export const updateOperationStatus = (
  current: OperationProgress,
  operationId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  error?: string
): OperationProgress => ({
  ...current,
  operations: (current.operations || []).map(op =>
    op.id === operationId
      ? { ...op, status, error }
      : op
  )
});
