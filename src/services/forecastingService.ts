
import { DemandMatrixService } from './forecasting/demandMatrixService';
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';

/**
 * Skill allocation strategy state
 */
let skillAllocationStrategy: 'distribute' | 'duplicate' = 'distribute';

/**
 * Main Forecasting Service
 * Provides a simplified interface to the forecasting functionality
 */
export class ForecastingService {
  /**
   * Generate demand matrix data
   */
  static async generateDemandMatrix(mode: DemandMatrixMode = 'demand-only'): Promise<{ matrixData: DemandMatrixData }> {
    return DemandMatrixService.generateDemandMatrix(mode);
  }

  /**
   * Generate and cache demand matrix data
   */
  static async generateAndCacheDemandMatrix(mode: DemandMatrixMode = 'demand-only'): Promise<{ matrixData: DemandMatrixData }> {
    return DemandMatrixService.generateAndCacheDemandMatrix(mode);
  }

  /**
   * Clear forecasting cache
   */
  static clearCache(): void {
    DemandMatrixService.clearCache();
  }
}

/**
 * Legacy API compatibility functions
 */

// Forecast generation
export const getForecast = async (params: any) => {
  // Mock implementation for backward compatibility
  return {
    data: [],
    financials: [],
    summary: {
      totalDemand: 0,
      totalCapacity: 0,
      gap: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0
    }
  };
};

export const generateForecast = getForecast;

// Cache management
export const clearForecastCache = () => {
  ForecastingService.clearCache();
};

// System validation
export const validateForecastSystem = async (): Promise<string[]> => {
  // Mock implementation for backward compatibility
  return [];
};

// Task breakdown
export const getTaskBreakdown = async (params: any): Promise<any[]> => {
  // Mock implementation for backward compatibility
  return [];
};

// Recurring task estimation
export const estimateRecurringTaskInstances = (params: any) => {
  // Mock implementation for backward compatibility
  return [];
};

// Skill allocation strategy management
export const setSkillAllocationStrategy = (strategy: 'distribute' | 'duplicate') => {
  skillAllocationStrategy = strategy;
};

export const getSkillAllocationStrategy = (): 'distribute' | 'duplicate' => {
  return skillAllocationStrategy;
};

// Default export
export default ForecastingService;
