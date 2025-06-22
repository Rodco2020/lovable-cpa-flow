
import { DemandMatrixService } from './forecasting/demandMatrixService';
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';

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
