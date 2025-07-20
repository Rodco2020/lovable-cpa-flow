import { SkillType } from './task';

/**
 * Demand Matrix Types
 * Enhanced with proper date boundaries for capacity calculations
 */

export interface MonthInfo {
  key: string;
  label: string;
  startDate?: Date; // PHASE 5 FIX: Make optional for backward compatibility
  endDate?: Date;   // PHASE 5 FIX: Make optional for backward compatibility
  index?: number;
}

export interface MonthlyStaffMetrics {
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercentage: number;
}

export interface StaffUtilizationData {
  staffId: string;
  staffName: string;
  totalHours: number;
  totalCapacityHours: number;
  utilizationPercentage: number;
  expectedHourlyRate: number;
  totalExpectedRevenue: number;
  totalSuggestedRevenue: number;
  expectedLessSuggested: number;
  monthlyData: Record<string, MonthlyStaffMetrics>;
}

export interface DemandMatrixDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  totalHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: TaskBreakdown[];
}

export interface TaskBreakdown {
  clientId: string;
  clientName: string;
  recurringTaskId: string;
  taskName: string;
  skillType: SkillType;
  estimatedHours: number;
  recurrencePattern: {
    type: string;
    interval: number;
    frequency: number;
  };
  monthlyHours: number;
  preferredStaffId?: string | null;
  preferredStaffName?: string | null;
}

export interface DemandMatrixData {
  months: MonthInfo[];
  skills: SkillType[];
  dataPoints: DemandMatrixDataPoint[];
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: Record<string, {
    totalHours: number;
    demandHours: number;
    taskCount: number;
    clientCount: number;
  }>;
  clientTotals: Map<string, number>;
  aggregationStrategy?: 'skill-based' | 'staff-based';
}

export type DemandMatrixMode = 'demand-only' | 'demand-capacity' | 'enhanced-capacity';

export interface DetailMatrixData {
  tasks: any[];
  months: MonthInfo[];
  totalTasks: number;
  totalHours: number;
  totalClients: number;
  skillSummary: Record<string, any>;
  clientSummary: Record<string, any>;
}

export interface MatrixDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercent: number;
}
