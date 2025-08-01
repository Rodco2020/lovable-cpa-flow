
import { SkillType } from "./task";

export type ForecastTimeframe = "week" | "month" | "quarter" | "year" | "custom";
export type ForecastMode = "virtual" | "actual";
export type GranularityType = "daily" | "weekly" | "monthly";
export type SkillAllocationStrategy = "duplicate" | "distribute";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SkillHours {
  skill: SkillType;
  hours: number;
  // Added metadata for additional context during calculation and rendering
  metadata?: {
    staffCount?: number;
    staffIds?: string[];
    hoursBreakdown?: Record<string, number>; // staffId -> hours
    calculationNotes?: string;
  };
}

// Adding SkillData interface for UI display
export interface SkillData {
  id: SkillType;
  name: string;
  color: string;
}

export interface ForecastData {
  period: string; // Format depends on granularity: "2023-05-15" for daily, "2023-W20" for weekly, "2023-05" for monthly
  demand: SkillHours[];
  capacity: SkillHours[];
  // Additional derived data properties for components
  timeSeriesData?: any[];
  skillDistribution?: any[];
  gapAnalysis?: any[];
  financialProjections?: FinancialProjection[];
  // Summary fields
  demandHours?: number;
  capacityHours?: number;
  gapHours?: number;
  projectedRevenue?: number;
  projectedCost?: number;
  projectedProfit?: number;
}

export interface FinancialProjection {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ForecastParameters {
  mode: ForecastMode;
  timeframe: ForecastTimeframe;
  dateRange: DateRange;
  granularity: GranularityType;
  includeSkills: SkillType[] | "all";
  skillAllocationStrategy?: SkillAllocationStrategy; // New parameter for hour allocation strategy
}

export interface ForecastResult {
  parameters: ForecastParameters;
  data: ForecastData[];
  financials: FinancialProjection[];
  summary: {
    totalDemand: number;
    totalCapacity: number;
    gap: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
  };
  generatedAt: Date;
}

// Task breakdown interface for hover details
export interface TaskBreakdownItem {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  skill: SkillType;
  hours: number;
  dueDate?: string;
  status?: string;
}

// Adding ClientTaskBreakdown interface
export interface ClientTaskBreakdown {
  totalMonthlyHours: number;
  categoryBreakdown: Record<string, number>;
}

// Re-export SkillType using 'export type' for TypeScript with isolatedModules
export type { SkillType };
