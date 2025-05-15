
import { SkillType } from "./task";

export type ForecastTimeframe = "week" | "month" | "quarter" | "year" | "custom";
export type ForecastMode = "virtual" | "actual";
export type GranularityType = "daily" | "weekly" | "monthly";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SkillHours {
  skill: SkillType;
  hours: number;
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

// Define SkillData type for UI display
export interface SkillData {
  id: string;
  name: string;
  color: string;
}

// Re-export SkillType using 'export type' for TypeScript with isolatedModules
export type { SkillType };
