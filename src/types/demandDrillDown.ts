
import { SkillType } from './task';

/**
 * Enhanced demand drill-down types with preferred staff support
 */
export interface DemandDrillDownData {
  skill: SkillType;
  month: string;
  monthLabel: string;
  totalDemandHours: number;
  taskCount: number;
  clientCount: number;
  clientBreakdown: DemandClientBreakdown[];
  taskBreakdown: DemandTaskBreakdown[];
  recurrencePatternSummary: RecurrencePatternSummary[];
  trends: {
    demandTrend: number;
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
  averageTaskSize: number;
}

/**
 * Enhanced task breakdown with preferred staff information
 */
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
  // NEW: Preferred staff fields
  preferredStaffId?: string;
  preferredStaffName?: string;
  preferredStaffRole?: string;
}

export interface RecurrencePatternSummary {
  pattern: string;
  taskCount: number;
  totalHours: number;
  percentage: number;
}
