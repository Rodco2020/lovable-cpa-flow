
/**
 * Types for Matrix Transformer modules
 */

export interface SkillMappingResult {
  skills: string[];
  skillMapping: Map<string, string>;
}

export interface TransformationContext {
  forecastData: any[];
  tasks: any[];
  skillMapping: Map<string, string>;
  months: Array<{ key: string; label: string }>;
}

export interface MatrixDataPoint {
  skillType: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: any[];
}

export interface MatrixTotals {
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
}

export interface SkillSummary {
  [skillName: string]: {
    totalHours: number;
    taskCount: number;
    clientCount: number;
  };
}

export interface RevenueEnhancedDataPointContext {
  skillType: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: any[];
  revenueData?: any;
}
