
/**
 * Type definitions for bulk operations functionality
 */

export interface BulkAssignment {
  templateIds: string[];
  clientIds: string[];
  config: BulkOperationConfig;
}

export interface BatchOperation {
  id: string;
  templateId: string;
  clientId: string;
  config: BulkOperationConfig;
}

export interface BulkOperationConfig {
  assignmentType?: 'ad-hoc' | 'recurring';
  taskType?: 'adhoc' | 'recurring';
  priority?: string;
  estimatedHours?: number;
  dueDate?: Date;
  preserveEstimatedHours?: boolean;
  preserveSkills?: boolean;
  generateImmediately?: boolean;
  
  // Recurring task specific
  recurrenceType?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  interval?: number;
  weekdays?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
}

export interface BatchProcessingConfig {
  operationType?: string;
  batchSize: number;
  concurrency: number;
}

export interface BulkOperationResult {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  errors: BulkOperationError[];
  processingTime: number;
  results: any[];
}

export interface BulkOperationError {
  clientId?: string;
  templateId?: string;
  error: string;
  details?: any;
}

export interface ProgressUpdate {
  completed: number;
  total: number;
  currentOperation: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}
