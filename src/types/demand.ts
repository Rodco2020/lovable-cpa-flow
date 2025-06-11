
import { RecurringTaskDB } from './task';

export interface DemandDataPoint {
  skillType: string;
  month: string;
  monthLabel: string; // Added missing monthLabel property
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown?: ClientTaskDemand[];
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
}

export interface RecurrencePattern {
  type: string;
  interval: number; // Added missing interval property
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
    };
  };
  clientTotals?: Map<string, number>;
  clientRevenue?: Map<string, number>; // NEW: Total expected revenue per client
  clientHourlyRates?: Map<string, number>; // NEW: Expected hourly rate per client
}

export interface DemandFilters {
  skills: string[];
  clients: string[];
  timeHorizon: {
    start: Date;
    end: Date;
  };
  includeInactive?: boolean; // Added missing includeInactive property
}

export type DemandMatrixMode = 'demand-only' | 'capacity-vs-demand';

export interface DemandDrillDownData {
  skillType: string;
  month: string;
  totalDemandHours: number;
  totalTasks: number;
  totalClients: number;
  taskBreakdown: ClientTaskDemand[];
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
}

export interface DemandRecommendation {
  skill: string;
  recommendation: string;
}

export interface DemandAlert {
  skill: string;
  alertMessage: string;
}

export interface TaskFilter {
  skill?: string;
  client?: string;
  taskName?: string;
  dueDate?: Date;
  priority?: string;
  category?: string;
  status?: string;
}

export interface TaskBreakdownItem {
  task: RecurringTaskDB;
  monthlyHours: number;
}

// Added missing forecast parameter types
export interface DemandForecastParameters {
  timeHorizon: 'quarter' | 'half-year' | 'year' | 'custom';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  includeSkills: string[] | 'all';
  includeClients: string[] | 'all';
  granularity: 'daily' | 'weekly' | 'monthly';
}

// Added missing forecast result type
export interface DemandForecastResult {
  parameters: DemandForecastParameters;
  data: any[]; // Using any[] to match existing usage
  demandMatrix: DemandMatrixData;
  summary: {
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
    averageMonthlyDemand: number;
  };
  generatedAt: Date;
}

// NEW: Client revenue data structure
export interface ClientRevenueData {
  clientId: string;
  clientName: string;
  expectedMonthlyRevenue: number;
  totalHours: number;
  totalRevenue: number;
  hourlyRate: number;
}
