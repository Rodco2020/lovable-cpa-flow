
/**
 * Demand Calculators Module
 * 
 * Central export point for all demand calculation services
 */

// Main calculator services
export { ClientTotalsCalculator } from './clientTotalsCalculator';
export { RevenueComparisonService } from './RevenueComparisonService';

// Types
export type { 
  RevenueDifferenceResult,
} from './RevenueComparisonService';

// Additional types that might be needed
export interface SkillDemandData {
  skillType: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
}

export interface RevenueComparisonResult {
  totalExpectedRevenue: number;
  totalSuggestedRevenue: number;
  totalDifference: number;
  percentageDifference: number;
}

export interface BulkRevenueCalculationOptions {
  includeInactive?: boolean;
  skillFilter?: string[];
  clientFilter?: string[];
  monthRange?: { start: string; end: string };
}

// Service error class for consistency
export class RevenueComparisonServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'RevenueComparisonServiceError';
  }
}
