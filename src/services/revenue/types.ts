
/**
 * Revenue Calculation Types and Interfaces
 * 
 * Defines the fundamental types used across the revenue calculation system
 */

export interface RevenueCalculation {
  clientId: string;
  expectedMonthlyRevenue: number;
  projectedAnnualRevenue: number;
  actualRevenueToDate: number;
  taskBasedRevenue: number;
  hourlyRateRevenue: number;
  averageHourlyRate: number;
  utilizationRate: number;
  profitMargin: number;
}

export interface TaskRevenueBreakdown {
  taskId: string;
  taskName: string;
  estimatedRevenue: number;
  actualRevenue: number;
  hourlyRate: number;
  estimatedHours: number;
  actualHours: number;
  profitMargin: number;
}

export interface RevenueProjection {
  projectedRevenue: number;
  confidenceLevel: number;
  factors: string[];
}

export interface RevenueValidationResult {
  isValid: boolean;
  issues: string[];
}

export interface RevenueConfig {
  defaultHourlyRate: number;
  defaultProfitMargin: number;
  cacheTTL: number;
}

export interface ClientData {
  id: string;
  legal_name: string;
  expected_monthly_revenue: number;
}

export interface TaskData {
  id: string;
  name: string;
  estimated_hours: number;
  required_skills: string[];
  status: string;
  client_id?: string;
}

export interface SkillRateMap extends Map<string, number> {}
