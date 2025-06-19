
/**
 * Data Fetcher Types
 * Centralized type definitions for the data fetcher modules
 */

import { DemandFilters } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';

export interface TaskQueryConfig {
  includeClients?: boolean;
  includePreferredStaff?: boolean;
  activeOnly?: boolean;
}

export interface FilterValidationResult {
  isValid: boolean;
  processedFilters: DemandFilters;
  issues: string[];
}

export interface TaskFetchResult {
  tasks: RecurringTaskDB[];
  totalCount: number;
  filteredCount: number;
  queryTime: number;
}

export interface ForecastPeriod {
  period: string;
  periodLabel: string;
  demand: any[];
  capacity: any[];
  demandHours: number;
  capacityHours: number;
}
