import { SkillType } from './task';

/**
 * Demand Matrix Types
 * Enhanced with proper date boundaries for capacity calculations
 */

export interface MonthInfo {
  key: string;
  label: string;
  startDate?: Date; // PHASE 5 FIX: Make optional for backward compatibility
  endDate?: Date;   // PHASE 5 FIX: Make optional for backward compatibility
  index?: number;
}

export interface MonthlyStaffMetrics {
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercentage: number;
}

export interface StaffUtilizationData {
  staffId: string;
  staffName: string;
  totalHours: number;
  totalCapacityHours: number;
  totalCapacity?: number; // Add missing property for compatibility
  utilizationPercentage: number;
  expectedHourlyRate: number;
  totalExpectedRevenue: number;
  totalSuggestedRevenue: number;
  expectedLessSuggested: number;
  monthlyData: Record<string, MonthlyStaffMetrics>;
}

export interface DemandMatrixDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  totalHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: TaskBreakdown[];
  isStaffSpecific?: boolean;
  actualStaffName?: string;
  suggestedRevenue?: number;
  expectedLessSuggested?: number;
}

export interface TaskBreakdown {
  clientId: string;
  clientName: string;
  recurringTaskId: string;
  taskName: string;
  skillType: SkillType;
  estimatedHours: number;
  recurrencePattern: {
    type: string;
    interval: number;
    frequency: number;
  };
  monthlyHours: number;
  preferredStaffId?: string | null;
  preferredStaffName?: string | null;
}

export interface DemandMatrixData {
  months: MonthInfo[];
  skills: SkillType[];
  dataPoints: DemandMatrixDataPoint[];
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: Record<string, {
    totalHours: number;
    demandHours: number;
    taskCount: number;
    clientCount: number;
    totalSuggestedRevenue?: number;
    totalExpectedLessSuggested?: number;
    averageFeeRate?: number;
  }>;
  clientTotals: Map<string, number>;
  aggregationStrategy?: 'skill-based' | 'staff-based';
  revenueTotals?: {
    totalSuggestedRevenue: number;
    totalExpectedRevenue: number;
    totalExpectedLessSuggested: number;
  };
  clientRevenue?: Map<string, number>;
  clientSuggestedRevenue?: Map<string, number>;
  clientExpectedLessSuggested?: Map<string, number>;
  clientHourlyRates?: Map<string, number>;
  skillFeeRates?: Map<string, number>; // Add missing property
}

export type DemandMatrixMode = 'demand-only' | 'demand-capacity' | 'enhanced-capacity';

export interface DetailMatrixData {
  tasks: any[];
  months: MonthInfo[];
  totalTasks: number;
  totalHours: number;
  totalClients: number;
  skillSummary: Record<string, any>;
  clientSummary: Record<string, any>;
}

export interface MatrixDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercent: number;
}

// Missing type exports that components expect
export interface DemandFilters {
  skillTypes?: string[];
  skills?: string[]; // Legacy compatibility
  clients?: string[];
  preferredStaff?: string[];
  timeHorizon?: string | { start: Date; end: Date }; // Support both string and object formats
  includeInactive?: boolean; // Add missing property
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ClientTaskDemand {
  clientId: string;
  clientName: string;
  taskId: string;
  taskName: string;
  skillType: SkillType;
  demandHours: number;
  month: string;
  monthlyHours?: number; // Add missing property
  recurringTaskId?: string; // Add missing property
  estimatedHours?: number; // Add missing property
  recurrencePattern?: {
    type: string;
    interval: number;
    frequency: number;
  };
  preferredStaffId?: string | null; // Add missing property
  preferredStaffName?: string | null; // Add missing property
}

export interface DemandDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  totalHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: TaskBreakdown[];
  isStaffSpecific?: boolean;
  actualStaffName?: string;
  actualStaffId?: string; // Add missing property
  underlyingSkillType?: SkillType; // Add missing property
  isUnassigned?: boolean; // Add missing property
  suggestedRevenue?: number;
  expectedLessSuggested?: number;
}

export interface ClientRevenueData {
  clientId: string;
  clientName?: string; // Add missing property
  expectedMonthlyRevenue: number;
  expectedRevenue?: number; // Add missing property for compatibility
  suggestedRevenue: number;
  expectedLessSuggested: number;
  totalHours?: number; // Add missing property for tests
}

export interface MatrixRevenueComparison {
  totalExpectedRevenue: number;
  totalSuggestedRevenue: number;
  totalExpectedLessSuggested: number;
  clientComparisons: Map<string, ClientRevenueData>;
}

export interface DemandForecastParameters {
  startDate: Date;
  endDate: Date;
  filters?: DemandFilters;
  includeRevenue?: boolean;
  dateRange?: { start: Date; end: Date }; // Add missing property
  skills?: string[]; // Add missing property
  clients?: string[]; // Add missing property
}

export interface LegacyDemandMatrixData extends DemandMatrixData {
  // Legacy compatibility interface
}

export const hasRevenueData = (data: DemandMatrixData): boolean => {
  return !!(data.revenueTotals || data.clientRevenue);
};

// Additional missing types
export interface SkillSummaryItem {
  skillType: SkillType;
  totalHours: number;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  totalSuggestedRevenue?: number;
  totalExpectedLessSuggested?: number;
  averageFeeRate?: number;
  revenue?: number; // Add missing property for utils
  hourlyRate?: number; // Add missing property for utils
  suggestedRevenue?: number; // Add missing property for utils
  expectedLessSuggested?: number; // Add missing property for utils
}

export interface SkillSummary {
  [key: string]: SkillSummaryItem;
}

export interface RecurrenceCalculation {
  monthlyHours: number;
  frequency: number;
  pattern: {
    type: string;
    interval: number;
  };
}

export interface DemandForecastResult {
  demandData: DemandMatrixData;
  metadata: {
    calculationTime: number;
    totalRecords: number;
    dateRange: { start: Date; end: Date };
  };
}

// Additional type for compatibility with TaskBreakdown conversion
export interface TaskBreakdownCompatible {
  clientId: string;
  clientName: string;
  taskId: string; // Required field from ClientTaskDemand
  taskName: string;
  skillType: SkillType;
  demandHours: number; // Required field from ClientTaskDemand
  month: string; // Required field from ClientTaskDemand
  recurringTaskId: string; // Required in TaskBreakdown
  estimatedHours: number; // Required in TaskBreakdown
  monthlyHours: number;
  recurrencePattern: {
    type: string;
    interval: number;
    frequency: number;
  };
  preferredStaffId?: string | null;
  preferredStaffName?: string | null;
}
