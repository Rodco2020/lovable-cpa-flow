
/**
 * Type definitions for Preferred Staff Filter Strategy
 * 
 * This module contains all type definitions used by the preferred staff filtering system,
 * providing clear interfaces for data analysis, diagnostics, and performance metrics.
 */

export interface StaffFilterAnalysis {
  totalTasks: number;
  tasksWithPreferredStaff: number;
  tasksWithoutPreferredStaff: number;
  uniquePreferredStaffIds: string[];
  preferredStaffNames: string[];
  filterCoverage: number; // Percentage of tasks that have preferred staff
  tasksByStaff: Map<string, number>;
}

export interface StaffFilterDiagnostics {
  filterInputs: {
    originalStaffIds: (string | number)[];
    normalizedStaffIds: string[];
    validationSuccess: boolean;
    invalidIds: (string | number)[];
  };
  dataAnalysis: StaffFilterAnalysis;
  filterResults: {
    originalDataPoints: number;
    filteredDataPoints: number;
    totalTasksProcessed: number;
    tasksRetained: number;
    tasksFiltered: number;
    filterEfficiency: number; // Percentage of tasks retained
  };
  potentialIssues: string[];
  recommendations: string[];
}

export interface FilteringPerformanceMetrics {
  processingTime: number;
  dataPointsProcessed: number;
  tasksProcessed: number;
  filterHitRate: number;
  memoryUsage?: number;
  cacheHits?: number;
  originalDataSize: number;
  filteredDataSize: number;
  compressionRatio: number;
}

export interface DataPointFilterResult {
  filteredDataPoint: import('@/types/demand').DemandDataPoint;
  tasksProcessed: number;
  tasksRetained: number;
  tasksFiltered: number;
  debugInfo?: {
    taskFieldMappings?: Array<{
      taskName: string;
      hasPreferredStaff: boolean;
      preferredStaffId: string | null;
      fieldAccessWorking: boolean;
    }>;
  };
}

export interface TaskFilterResult {
  task: import('@/types/demand').ClientTaskDemand;
  retained: boolean;
  filterReason?: string;
  debugInfo?: {
    fieldAccess: {
      preferredStaffId: any;
      fieldExists: boolean;
      fieldType: string;
    };
    normalization: {
      normalizedId: string | null;
      normalizationWorked: boolean;
    };
    matching: {
      filterIds: string[];
      isMatch: boolean;
      matchFound: boolean;
    };
  };
}
