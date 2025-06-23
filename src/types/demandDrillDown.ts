
import { SkillType, RecurringTask } from './task';
import { ClientTaskDemand } from './demand';

/**
 * Demand-specific drill-down types - Phase 4 Enhanced
 * Extended with staff assignment information and unassigned task handling
 */
export interface DemandDrillDownData {
  skill: SkillType;
  month: string;
  monthLabel: string;
  totalDemandHours: number;
  taskCount: number;
  clientCount: number;
  
  // Demand-specific breakdowns
  clientBreakdown: DemandClientBreakdown[];
  taskBreakdown: DemandTaskBreakdown[];
  recurrencePatternSummary: RecurrencePatternSummary[];
  
  // Trend analysis for demand
  trends: {
    demandTrend: number; // Month-over-month change %
    taskGrowth: number;
    clientGrowth: number;
    // Phase 4: Enhanced with staff assignment trends
    assignmentRate: number;
    assignmentTrend: number;
    staffUtilizationTrend: number;
  };

  // Phase 4: Staff assignment information
  staffAssignmentSummary: Array<{
    staffId: string;
    staffName: string;
    isUnassigned: boolean;
    taskCount: number;
    totalHours: number;
    percentage: number;
  }>;
  unassignedHours: number;
  assignedHours: number;
  assignmentRate: number;
}

export interface DemandClientBreakdown {
  clientId: string;
  clientName: string;
  demandHours: number;
  taskCount: number;
  recurringTasks: number;
  adhocTasks: number;
  averageTaskSize: number; // hours
  // Phase 4: Enhanced with staff assignment information
  assignedHours: number;
  unassignedHours: number;
  assignedTasks: number;
  unassignedTasks: number;
  assignmentRate: number;
  uniqueStaffCount: number;
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
  // Phase 4: Enhanced with staff assignment details
  preferredStaffId?: string | null;
  isUnassigned: boolean;
  staffInfo?: {
    id: string;
    name: string;
    hasError?: boolean;
  } | null;
  assignmentStatus: 'Assigned' | 'Unassigned' | 'Unknown';
}

export interface RecurrencePatternSummary {
  pattern: string; // "Monthly", "Quarterly", "Weekly", etc.
  taskCount: number;
  totalHours: number;
  percentage: number;
}
