
import { RecurringTaskDB } from '@/types/task';
import { PreferredStaffInfo, PreferredStaffMetadata } from '@/types/demand';

/**
 * Core interfaces for matrix transformation with preferred staff support
 */

export interface TransformationInput {
  tasks: RecurringTaskDB[];
  clients: Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>;
  skills: string[];
  months: Array<{ key: string; label: string }>;
  /**
   * NEW: Staff information for preferred staff resolution
   */
  staffMembers?: Array<{
    id: string;
    full_name: string;
    role_title?: string;
    assigned_skills: string[];
  }>;
}

export interface TaskPeriodData {
  taskId: string;
  clientId: string;
  clientName: string;
  skillType: string;
  estimatedHours: number;
  monthlyHours: number;
  recurrencePattern: {
    type: string;
    interval: number;
    frequency: number;
  };
  /**
   * NEW: Preferred staff information for this task period
   */
  preferredStaff?: PreferredStaffInfo;
}

export interface SkillMonthData {
  skillType: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: TaskPeriodData[];
  /**
   * NEW: Preferred staff metadata for this skill/month combination
   */
  preferredStaffMetadata?: PreferredStaffMetadata;
}

export interface ClientRevenueInfo {
  clientId: string;
  clientName: string;
  expectedMonthlyRevenue: number;
  totalHours: number;
  totalRevenue: number;
  hourlyRate: number;
  /**
   * NEW: Preferred staff summary for this client
   */
  preferredStaffSummary?: {
    totalTasksWithPreferredStaff: number;
    uniquePreferredStaff: number;
    preferredStaffBreakdown: Array<{
      staffId: string;
      staffName: string;
      taskCount: number;
      totalHours: number;
    }>;
  };
}

export interface SkillFeeRate {
  skillName: string;
  feeRate: number;
  source: 'database' | 'fallback' | 'calculated';
}

export interface MatrixTotals {
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
}

export interface SkillSummary {
  [key: string]: {
    totalHours: number;
    taskCount: number;
    clientCount: number;
    /**
     * NEW: Optional preferred staff summary for skills
     */
    preferredStaffSummary?: {
      totalTasksWithPreferredStaff: number;
      uniquePreferredStaff: number;
      topPreferredStaff: Array<{
        staffId: string;
        staffName: string;
        taskCount: number;
        totalHours: number;
      }>;
    };
  };
}

export interface SkillMappingResult {
  skills: string[];
  skillMapping: Map<string, string>;
}
