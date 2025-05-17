
export type ForecastMode = 'virtual' | 'actual';
export type ForecastHorizon = 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type SkillType = string;

export type SkillAllocationStrategy = 'duplicate' | 'distribute';

export interface ForecastTimeframe {
  startDate: Date;
  endDate: Date;
}

export interface ForecastData {
  horizon: ForecastHorizon;
  mode: ForecastMode;
  timeframe: ForecastTimeframe;
  demand: ForecastDemand;
  capacity: ForecastCapacity;
  gap: ForecastGap;
  financials: FinancialProjection;
  timestamp: Date;
  
  // Additional properties for UI components
  period: string;
  data?: any[];
  timeSeriesData?: any[];
  skillDistribution?: any[];
  gapAnalysis?: any[];
  demandHours?: number;
  capacityHours?: number;
  gapHours?: number;
  projectedRevenue?: number;
  projectedCost?: number;
  projectedProfit?: number;
  summary?: {
    totalDemand: number;
    totalCapacity: number;
    gap: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
  };
}

export interface SkillBreakdown {
  skillType: string;
  hours: number;
  taskCount: number;
  percentage: number;
  tasks: any[];
}

export interface SkillDemandData {
  skillType: string;
  hours: number;
  startDate: Date;
  endDate: Date;
}

export interface ForecastDemand {
  totalHours: number;
  taskCount: number;
  skillBreakdowns: Record<string, SkillBreakdown>;
  timeBreakdown: SkillDemandData[];
  forEach?: (callback: (item: any) => void) => void;
}

export interface ForecastCapacity {
  totalHours: number;
  staffCount: number;
  skillBreakdowns: Record<string, SkillBreakdown>;
  timeBreakdown: SkillDemandData[];
  forEach?: (callback: (item: any) => void) => void;
}

export interface GapAnalysis {
  skillType: string;
  demandHours: number;
  capacityHours: number;
  gapHours: number;
  isSurplus: boolean;
  utilizationPercentage: number;
  status: 'critical' | 'warning' | 'healthy' | 'excess';
}

export interface ForecastGap {
  totalGap: number;
  hasSurplus: boolean;
  utilizationPercentage: number;
  skillGaps: Record<string, GapAnalysis>;
}

export interface FinancialProjection {
  monthlyRecurringRevenue: number;
  projectedRevenue: number;
  projectedCost: number;
  projectedProfit: number;
  profitMargin: number;
  revenueAtRisk: number;
  skillBreakdown: Record<string, any>;
  
  // Additional properties for UI components
  period?: string;
  revenue?: number;
  cost?: number;
  profit?: number;
}

export interface SkillData {
  id: SkillType;
  name: string;
  color: string;
}

export interface ForecastParameters {
  mode: ForecastMode;
  timeframe: ForecastHorizon | 'custom';
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  granularity: 'daily' | 'weekly' | 'monthly';
  includeSkills: SkillType[] | 'all';
}

export interface ForecastResult {
  data: any[];
  financials: any[];
  summary: {
    totalDemand: number;
    totalCapacity: number;
    gap: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
  };
}
