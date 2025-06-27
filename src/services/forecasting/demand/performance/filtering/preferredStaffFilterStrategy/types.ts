
import { DemandMatrixData, DemandFilters } from '@/types/demand';

/**
 * Type definitions for the Preferred Staff Filter Strategy
 * 
 * This module defines all interfaces and types used throughout the preferred staff
 * filtering system to ensure type safety and consistency.
 */

export interface StaffFilterAnalysis {
  hasValidFilters: boolean;
  validFilterCount: number;
  potentialMatches: number;
  normalizationSuccessRate: number;
  expectedFilteringSuccess: boolean;
}

export interface StaffFilterDiagnostics {
  inputValidation: {
    filterStaffIds: (string | number | null | undefined)[];
    filterStaffIdTypes: Array<{ id: any; type: string }>;
    normalizedFilterIds: string[];
    normalizationWorking: boolean;
  };
  dataAnalysis: {
    dataContainsTasksWithStaff: number;
    originalStaffIdsInData: string[];
    normalizedStaffIdsInData: string[];
    exactNormalizedMatches: string[];
    potentialMatches: boolean;
  };
  processingResults: {
    dataPointsProcessed: number;
    dataPointsWithTasks: number;
    totalTasksProcessed: number;
    tasksWithPreferredStaffProcessed: number;
  };
  troubleshooting: {
    filterArrayEmpty: boolean;
    dataArrayEmpty: boolean;
    noMatches: boolean;
    normalizationIssue: boolean;
  };
}

export interface FilteringPerformanceMetrics {
  processingTime: number;
  originalDataPoints: number;
  filteredDataPoints: number;
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  filterEffectiveness: string;
  normalizationSuccess: boolean;
  qualityMetrics: {
    normalizationSuccessRate: string;
    dataRetentionRate: string;
    taskRetentionRate: string;
  };
}

export interface DataPointFilterResult {
  skillType: string;
  month: string;
  originalTasks: number;
  filteredTasks: number;
  tasksRemoved: number;
  filterEfficiency: string;
  retainedTaskNames: string[];
  excludedTaskNames: string[];
}

export interface TaskFilterResult {
  taskName: string;
  taskStaffId: string | number | null | undefined;
  taskStaffIdType: string;
  normalizedTaskStaffId: string | undefined;
  taskStaffName?: string;
  filterStaffIds: string[];
  isMatch: boolean;
  comparisonMethod: string;
  matchingFilterId: string | null;
}
