
import { SkillType, RecurringTask } from './task';
import { ClientTaskDemand } from './demand';

/**
 * Demand-specific drill-down types extending existing analytics types
 */
export interface DemandDrillDownData {
  skill: SkillType;
  month: string;
  monthLabel: string;
  totalDemandHours: number;
  taskCount: number;
  clientCount: number;
  
  // Properties expected by handlers
  tasks?: DemandTaskBreakdown[];
  totalHours?: number;
  
  // Demand-specific breakdowns
  clientBreakdown: DemandClientBreakdown[];
  taskBreakdown: DemandTaskBreakdown[];
  recurrencePatternSummary: RecurrencePatternSummary[];
  
  // Trend analysis for demand
  trends: {
    demandTrend: number; // Month-over-month change %
    taskGrowth: number;
    clientGrowth: number;
  };
}

export interface DemandClientBreakdown {
  clientId: string;
  clientName: string;
  demandHours: number;
  taskCount: number;
  recurringTasks: number;
  adhocTasks: number;
  averageTaskSize: number; // hours
}

export interface DemandTaskBreakdown {
  taskId: string;
  taskName: string;
  clientId: string;
  clientName: string;
  skillType: SkillType;
  estimatedHours: number;
  monthlyHours: number;
  recurrenceType: string;
  recurrenceFrequency: number;
  isRecurring: boolean;
}

export interface RecurrencePatternSummary {
  pattern: string; // "Monthly", "Quarterly", "Weekly", etc.
  taskCount: number;
  totalHours: number;
  percentage: number;
}
