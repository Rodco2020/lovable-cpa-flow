
/**
 * Enhanced Data Filter Types
 * 
 * Defines all interfaces and types used by the enhanced filtering system
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';

export interface FilteringOptions {
  enableValidation?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableLogging?: boolean;
  fallbackOnError?: boolean;
}

export interface FilteringResult {
  filteredData: DemandMatrixData;
  success: boolean;
  validationResult?: ValidationResult;
  performanceStats?: PerformanceStats;
  errors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ message: string; severity: 'error' | 'warning' }>;
  warnings: string[];
}

export interface PerformanceStats {
  totalProcessingTime: number;
  filterSteps: Array<{
    name: string;
    duration: number;
    itemsProcessed: number;
  }>;
}

export interface FilteringMetrics {
  filterEfficiency: number;
  dataReduction: number;
  processingSpeed: number;
}

export interface PreferredStaffFilter {
  staffIds: string[];
  includeUnassigned: boolean;
  showOnlyPreferred: boolean;
}

export interface TimeHorizonFilter {
  start: Date;
  end: Date;
}
