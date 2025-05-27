
import { AssignmentConfig } from '@/components/clients/TaskWizard/AssignmentConfiguration';

/**
 * Bulk Operations Service Types
 * 
 * Defines the interfaces and types used throughout the bulk operations process.
 */

export interface BulkAssignment {
  templateIds: string[];
  clientIds: string[];
  config: AssignmentConfig;
}

export interface BatchOperation {
  id: string;
  clientId: string;
  templateId: string;
  config: AssignmentConfig;
}

export interface BulkOperationConfig {
  operationType: string;
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
  clientId: string;
  templateId: string;
  error: string;
}

export interface ProgressUpdate {
  completed: number;
  total: number;
  currentOperation: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}
