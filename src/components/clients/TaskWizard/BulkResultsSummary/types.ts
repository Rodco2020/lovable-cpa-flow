
/**
 * Bulk Results Summary Types
 * 
 * Type definitions for the BulkResultsSummary component and its sub-components.
 */

import { BulkOperationResult } from '../types';

export interface BulkResultsSummaryProps {
  result: BulkOperationResult;
  onRetryFailed?: () => void;
  onExportResults?: () => void;
  onViewDetails?: (resultId: string) => void;
}

export interface ResultsHeaderProps {
  result: BulkOperationResult;
  onRetryFailed?: () => void;
  onExportResults: () => void;
}

export interface SummaryStatsProps {
  result: BulkOperationResult;
  successRate: number;
}

export interface PerformanceMetricsProps {
  result: BulkOperationResult;
  successRate: number;
}

export interface SuccessfulOperationsProps {
  result: BulkOperationResult;
  onViewDetails?: (resultId: string) => void;
}

export interface FailedOperationsProps {
  result: BulkOperationResult;
}
