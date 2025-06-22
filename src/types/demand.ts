
import { RecurringTaskDB } from './task';

export interface DemandDataPoint {
  skillType: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown?: ClientTaskDemand[];
  /** 
   * NEW: Suggested revenue for this skill/month combination
   * Calculated using demand hours × skill fee rate
   */
  suggestedRevenue?: number;
  /** 
   * NEW: Difference between expected and suggested revenue
   * Positive = expected exceeds suggested, Negative = suggested exceeds expected
   */
  expectedLessSuggested?: number;
}

export interface ClientTaskDemand {
  clientId: string;
  clientName: string;
  recurringTaskId: string;
  taskName: string;
  skillType: string;
  estimatedHours: number;
  recurrencePattern: RecurrencePattern;
  monthlyHours: number;
  /** 
   * NEW: Suggested revenue for this specific task
   * Calculated using task hours × skill fee rate
   */
  suggestedRevenue?: number;
  /** NEW: Preferred staff information for task breakdown */
  preferredStaffId?: string;
  preferredStaffName?: string;
}

export interface RecurrencePattern {
  type: string;
  interval: number;
  frequency: number;
}

export interface DemandMatrixData {
  months: Array<{ key: string; label: string }>;
  skills: string[];
  dataPoints: DemandDataPoint[];
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: {
    [key: string]: {
      totalHours: number;
      taskCount: number;
      clientCount: number;
      /** NEW: Total suggested revenue for this skill across all months */
      totalSuggestedRevenue?: number;
      /** NEW: Total expected less suggested for this skill across all months */
      totalExpectedLessSuggested?: number;
      /** NEW: Average fee rate for this skill */
      averageFeeRate?: number;
    };
  };
  clientTotals?: Map<string, number>;
  clientRevenue?: Map<string, number>;
  clientHourlyRates?: Map<string, number>;
  /** 
   * NEW: Total suggested revenue per client across all skills/months
   * Key: clientId, Value: total suggested revenue
   */
  clientSuggestedRevenue?: Map<string, number>;
  /** 
   * NEW: Total expected less suggested per client across all skills/months
   * Key: clientId, Value: total expected less suggested amount
   */
  clientExpectedLessSuggested?: Map<string, number>;
  /** 
   * NEW: Skill fee rates used for revenue calculations
   * Key: skillName, Value: fee rate per hour
   */
  skillFeeRates?: Map<string, number>;
  /** 
   * NEW: Matrix-level totals for revenue calculations
   */
  revenueTotals?: {
    totalSuggestedRevenue: number;
    totalExpectedRevenue: number;
    totalExpectedLessSuggested: number;
  };
  /** NEW: Staff-related data for preferred staff filtering */
  staffSummary?: {
    [key: string]: {
      staffId: string;
      staffName: string;
      totalHours: number;
      taskCount: number;
      clientCount: number;
    };
  };
  /** NEW: Available staff for filtering */
  availableStaff?: Array<{ id: string; name: string; }>;
}

/** ENHANCED: DemandFilters interface with preferred staff support */
export interface DemandFilters {
  skills: string[];
  clients: string[];
  /** NEW: Preferred staff filter - now optional for backward compatibility */
  preferredStaff?: string[];
  timeHorizon: {
    start: Date;
    end: Date;
  };
  includeInactive?: boolean;
}

export type DemandMatrixMode = 'demand-only' | 'capacity-vs-demand';

export interface DemandDrillDownData {
  skillType: string;
  month: string;
  totalDemandHours: number;
  totalTasks: number;
  totalClients: number;
  taskBreakdown: ClientTaskDemand[];
  /** NEW: Revenue breakdown for drill-down data */
  revenueBreakdown?: {
    totalSuggestedRevenue: number;
    totalExpectedRevenue: number;
    totalExpectedLessSuggested: number;
  };
  /** NEW: Staff breakdown for drill-down data */
  staffBreakdown?: Array<{
    staffId: string;
    staffName: string;
    hours: number;
    taskCount: number;
  }>;
}

export interface RecurrenceCalculation {
  monthlyOccurrences: number;
  monthlyHours: number;
  taskId: string;
  nextDueDates: Date[];
}

export interface DemandTrend {
  month: string;
  demandHours: number;
  trendValue: number;
  /** NEW: Revenue trend data */
  suggestedRevenue?: number;
  expectedLessSuggested?: number;
}

export interface DemandRecommendation {
  skill: string;
  recommendation: string;
  /** NEW: Revenue-based recommendations */
  revenueImpact?: {
    suggestedRevenue: number;
    expectedRevenue: number;
    profitabilityAssessment: 'profitable' | 'break-even' | 'unprofitable';
  };
}

export interface DemandAlert {
  skill: string;
  alertMessage: string;
  /** NEW: Revenue-related alert context */
  revenueContext?: {
    suggestedRevenue: number;
    expectedRevenue: number;
    variance: number;
    severity: 'low' | 'medium' | 'high';
  };
}

export interface TaskFilter {
  skill?: string;
  client?: string;
  taskName?: string;
  dueDate?: Date;
  priority?: string;
  category?: string;
  status?: string;
  /** NEW: Preferred staff filter */
  preferredStaff?: string;
}

export interface TaskBreakdownItem {
  task: RecurringTaskDB;
  monthlyHours: number;
  /** NEW: Revenue information for task breakdown */
  suggestedRevenue?: number;
}

export interface DemandForecastParameters {
  timeHorizon: 'quarter' | 'half-year' | 'year' | 'custom';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  includeSkills: string[] | 'all';
  includeClients: string[] | 'all';
  /** NEW: Include preferred staff in forecast parameters - now optional for backward compatibility */
  includePreferredStaff?: string[] | 'all';
  granularity: 'daily' | 'weekly' | 'monthly';
  /** NEW: Revenue calculation options */
  includeRevenueCalculations?: boolean;
  useClientExpectedRevenue?: boolean;
}

export interface DemandForecastResult {
  parameters: DemandForecastParameters;
  data: any[];
  demandMatrix: DemandMatrixData;
  summary: {
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
    averageMonthlyDemand: number;
    /** NEW: Revenue summary information */
    totalSuggestedRevenue?: number;
    totalExpectedRevenue?: number;
    totalExpectedLessSuggested?: number;
    averageProfitMargin?: number;
  };
  generatedAt: Date;
}

/**
 * Enhanced ClientRevenueData interface with revenue calculation fields
 * Extended to support the new revenue columns in the matrix
 */
export interface ClientRevenueData {
  clientId: string;
  clientName: string;
  expectedMonthlyRevenue: number;
  totalHours: number;
  totalRevenue: number;
  hourlyRate: number;
  /** NEW: Calculated suggested revenue based on skill rates and demand hours */
  suggestedRevenue?: number;
  /** NEW: Difference between expected and suggested revenue */
  expectedLessSuggested?: number;
  /** NEW: Revenue calculation metadata */
  revenueCalculationMetadata?: {
    calculatedAt: Date;
    skillBreakdown: Array<{
      skillName: string;
      hours: number;
      feeRate: number;
      suggestedRevenue: number;
    }>;
    usingFallbackRates: boolean;
    calculationNotes?: string;
  };
}

/**
 * NEW: Interface for staff-related demand data
 */
export interface StaffDemandData {
  staffId: string;
  staffName: string;
  totalHours: number;
  taskCount: number;
  clientCount: number;
  skills: string[];
  tasksAssigned: Array<{
    taskId: string;
    taskName: string;
    clientName: string;
    estimatedHours: number;
    skillType: string;
  }>;
}

/**
 * NEW: Interface for staff filter options
 */
export interface StaffFilterOption {
  id: string;
  name: string;
  taskCount?: number;
  totalHours?: number;
}

/**
 * Migration compatibility interface for backward compatibility
 * @deprecated Use DemandMatrixData directly - this interface maintains compatibility during transition
 */
export interface LegacyDemandMatrixData {
  months: Array<{ key: string; label: string }>;
  skills: string[];
  dataPoints: Array<{
    skillType: string;
    month: string;
    monthLabel: string;
    demandHours: number;
    taskCount: number;
    clientCount: number;
    taskBreakdown?: ClientTaskDemand[];
  }>;
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: {
    [key: string]: {
      totalHours: number;
      taskCount: number;
      clientCount: number;
    };
  };
  clientTotals?: Map<string, number>;
  clientRevenue?: Map<string, number>;
  clientHourlyRates?: Map<string, number>;
}

/**
 * Type guard to check if data structure includes revenue fields
 */
export function hasRevenueData(data: DemandMatrixData | LegacyDemandMatrixData): data is DemandMatrixData {
  return 'clientSuggestedRevenue' in data || 'revenueTotals' in data;
}

/**
 * Utility type for optional revenue fields in data points
 */
export type RevenueEnabledDataPoint = DemandDataPoint & {
  suggestedRevenue: number;
  expectedLessSuggested: number;
};

/**
 * Type for filtering data points by revenue criteria
 */
export interface RevenueFilter {
  minSuggestedRevenue?: number;
  maxSuggestedRevenue?: number;
  minExpectedLessSuggested?: number;
  maxExpectedLessSuggested?: number;
  profitabilityThreshold?: number;
}
