
import { SkillType, RecurringTask } from './task';
import { ForecastData, DateRange, SkillHours } from './forecasting';

/**
 * Demand-specific types for the new Demand Matrix module
 * These types mirror capacity structures but focus on task templates and client assignments
 */

export interface DemandForecastParameters {
  timeHorizon: 'month' | 'quarter' | 'year' | 'custom';
  dateRange: DateRange;
  includeSkills: SkillType[] | 'all';
  includeClients: string[] | 'all';
  granularity: 'monthly' | 'weekly' | 'daily';
}

export interface ClientTaskDemand {
  clientId: string;
  clientName: string;
  recurringTaskId: string;
  taskName: string;
  skillType: SkillType;
  estimatedHours: number;
  recurrencePattern: {
    type: string;
    interval?: number;
    frequency: number; // occurrences per period
  };
  monthlyHours: number; // calculated based on recurrence
}

export interface DemandDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  // Task breakdown for drill-down functionality
  taskBreakdown: ClientTaskDemand[];
}

export interface DemandMatrixData {
  months: Array<{ key: string; label: string }>;
  skills: SkillType[];
  dataPoints: DemandDataPoint[];
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  // Summary by skill
  skillSummary: Record<SkillType, {
    totalHours: number;
    taskCount: number;
    clientCount: number;
  }>;
}

export interface DemandForecastResult {
  parameters: DemandForecastParameters;
  data: ForecastData[];
  demandMatrix: DemandMatrixData;
  summary: {
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
    averageMonthlyDemand: number;
  };
  generatedAt: Date;
}

// Filter types for demand analysis
export interface DemandFilters {
  skills: SkillType[];
  clients: string[];
  timeHorizon: {
    start: Date;
    end: Date;
  };
  includeInactive?: boolean;
}

// Recurrence calculation helpers
export interface RecurrenceCalculation {
  taskId: string;
  monthlyOccurrences: number;
  monthlyHours: number;
  nextDueDates: Date[];
}

export type DemandMatrixMode = 'demand-only' | 'demand-vs-capacity';
