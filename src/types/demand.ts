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
}
