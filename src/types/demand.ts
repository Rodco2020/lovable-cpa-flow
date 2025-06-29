
export type DemandMatrixMode = 'demand-only' | 'demand-capacity' | 'gap-analysis';

export interface MonthInfo {
  key: string;
  label: string;
  index: number;
}

export interface SkillSummaryItem {
  demandHours: number;
  taskCount: number;
  revenue?: number;
  hourlyRate?: number;
  suggestedRevenue?: number;
  expectedLessSuggested?: number;
  // NEW: Additional properties needed by the code
  totalHours: number;
  clientCount: number;
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
  // NEW: Additional properties needed by the code
  clientId: string;
  clientName: string;
  expectedMonthlyRevenue: number;
}

export interface DemandFilters {
  skills?: string[];
  clients?: string[];
  preferredStaff?: (string | number | null | undefined)[];
  timeHorizon?: {
    start: Date;
    end: Date;
  };
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
  // NEW: Additional properties needed by some code
  skillFeeRates?: Map<string, number>;
}

export interface DemandDataPoint {
  skillType: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: ClientTaskDemand[];
  isStaffSpecific?: boolean;
  isUnassigned?: boolean;
  actualStaffId?: string;
  actualStaffName?: string;
  underlyingSkillType?: string;
  // NEW: Revenue-related properties needed by the code
  suggestedRevenue?: number;
  expectedLessSuggested?: number;
}

// NEW: Add missing type export
export interface DemandForecastParameters {
  startDate: Date;
  endDate: Date;
  skills?: string[];
  clients?: string[];
  preferredStaff?: string[];
}

// NEW: Add missing type for matrix revenue comparison
export interface MatrixRevenueComparison {
  expectedRevenue: number;
  suggestedRevenue: number;
  difference: number;
}
