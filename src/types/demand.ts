
export type DemandMatrixMode = 'demand-only' | 'demand-capacity' | 'gap-analysis';

export interface MonthInfo {
  key: string;
  label: string;
  index?: number; // Make optional to support existing code
  startDate?: Date;
  endDate?: Date;
}

export interface SkillSummaryItem {
  demandHours: number;
  totalHours: number;
  taskCount: number;
  clientCount: number;
  revenue?: number;
  hourlyRate?: number;
  suggestedRevenue?: number;
  expectedLessSuggested?: number;
  totalSuggestedRevenue?: number;
  totalExpectedLessSuggested?: number;
  averageFeeRate?: number;
}

export interface SkillSummary {
  [skill: string]: SkillSummaryItem;
}

export interface ClientTaskDemand {
  clientId: string;
  clientName: string;
  recurringTaskId: string;
  taskName: string;
  skillType: string;
  estimatedHours: number;
  recurrencePattern: {
    type: string;
    interval: number;
    frequency: number;
  };
  monthlyHours: number;
  preferredStaffId: string | null | undefined;
  preferredStaffName?: string;
}

export interface RecurrenceCalculation {
  monthlyOccurrences: number;
  monthlyHours: number;
  taskId: string;
  nextDueDates: Date[];
}

export interface ClientRevenueData {
  expectedRevenue: number;
  suggestedRevenue: number;
  clientId: string;
  clientName: string;
  expectedMonthlyRevenue: number;
  totalHours: number; // Add missing property
}

export interface DemandFilters {
  skills?: string[];
  clients?: string[];
  preferredStaff?: (string | number | null | undefined)[];
  timeHorizon?: {
    start: Date;
    end: Date;
  };
  includeInactive?: boolean;
}

export interface DemandMatrixData {
  months: MonthInfo[];
  skills: string[];
  dataPoints: DemandDataPoint[];
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: SkillSummary;
  clientTotals: Map<string, number>;
  clientRevenue?: Map<string, number>;
  clientHourlyRates?: Map<string, number>;
  clientSuggestedRevenue?: Map<string, number>;
  clientExpectedLessSuggested?: Map<string, number>;
  revenueTotals?: {
    totalSuggestedRevenue: number;
    totalExpectedRevenue: number;
    totalExpectedLessSuggested: number;
  };
  aggregationStrategy?: 'skill-based' | 'staff-based';
  skillFeeRates?: Map<string, number>;
}

export interface DemandDataPoint {
  skillType: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  totalHours: number; // Add missing property
  taskCount: number;
  clientCount: number;
  taskBreakdown: ClientTaskDemand[];
  isStaffSpecific?: boolean;
  isUnassigned?: boolean;
  actualStaffId?: string;
  actualStaffName?: string;
  underlyingSkillType?: string;
  suggestedRevenue?: number;
  expectedLessSuggested?: number;
}

export interface DemandForecastParameters {
  startDate?: Date;
  endDate?: Date;
  skills?: string[];
  clients?: string[];
  preferredStaff?: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  includeSkills?: boolean;
  includeClients?: boolean;
}

export interface DemandForecastResult {
  matrixData: DemandMatrixData;
  success: boolean;
  errors?: string[];
}

export interface MatrixRevenueComparison {
  expectedRevenue: number;
  suggestedRevenue: number;
  difference: number;
}

// NEW: Staff Forecast Summary interfaces for Phase 1 - FIXED: Changed Map to Record
export interface MonthlyStaffMetrics {
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercentage: number;
}

export interface StaffUtilizationData {
  staffId: string;
  staffName: string;
  monthlyData: Record<string, MonthlyStaffMetrics>; // FIXED: Changed from Map to Record
  totalHours: number;
  totalCapacity: number;
  utilizationPercentage: number;
  totalExpectedRevenue: number;
  expectedHourlyRate: number;
  totalSuggestedRevenue: number;
  expectedLessSuggested: number;
}

// Legacy support types
export interface LegacyDemandMatrixData extends DemandMatrixData {
  // Legacy properties for backward compatibility
}

export function hasRevenueData(data: DemandMatrixData): boolean {
  return !!(data.revenueTotals && data.revenueTotals.totalSuggestedRevenue > 0);
}
