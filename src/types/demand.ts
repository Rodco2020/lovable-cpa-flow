import { RecurringTaskDB } from './task';

export interface DemandDataPoint {
  skillType: string;
  month: string;
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
    };
  };
  clientTotals?: Map<string, number>; // New field for client totals
}

export interface DemandFilters {
  skills: string[];
  clients: string[];
  timeHorizon: {
    start: Date;
    end: Date;
  };
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
