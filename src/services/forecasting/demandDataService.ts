
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { debugLog } from './logger';
import { DemandMatrixService } from './demandMatrixService';
import { getErrorMessage } from '@/utils/errorUtils';

/**
 * Demand Data Service
 * 
 * High-level service for managing demand-related data operations
 * and coordinating between different demand data sources.
 */
export class DemandDataService {
  /**
   * Get demand matrix data with filters
   */
  static async getDemandMatrixData(filters: DemandFilters = {}): Promise<DemandMatrixData> {
    debugLog('Getting demand matrix data', { filters });

    try {
      return await DemandMatrixService.generateDemandMatrix(filters);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      debugLog('Error getting demand matrix data', { error: errorMessage });
      throw new Error(`Failed to get demand matrix data: ${errorMessage}`);
    }
  }

  /**
   * Process forecast data into demand matrix format
   */
  static async processForecastData(
    forecastData: ForecastData[],
    filters: DemandFilters = {}
  ): Promise<DemandMatrixData> {
    debugLog('Processing forecast data', { 
      forecastDataLength: forecastData.length,
      filters 
    });

    try {
      // Import the matrix transformer
      const { MatrixTransformerCore } = await import('./demand/matrixTransformer');
      
      // For now, we'll create an empty tasks array since we're working with forecast data
      const emptyTasks: any[] = [];
      
      // Transform the forecast data to matrix format
      const matrixData = await MatrixTransformerCore.transformToMatrixData(
        forecastData,
        emptyTasks
      );

      // Apply filters if provided
      if (Object.keys(filters).length > 0) {
        return await DemandMatrixService.applyFiltering(matrixData, filters);
      }

      return matrixData;

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      debugLog('Error processing forecast data', { error: errorMessage });
      throw new Error(`Failed to process forecast data: ${errorMessage}`);
    }
  }

  /**
   * Validate demand data
   */
  static validateDemandData(data: DemandMatrixData): { isValid: boolean; issues: string[] } {
    return DemandMatrixService.validateMatrix(data);
  }

  /**
   * Get demand summary statistics
   */
  static getDemandSummary(data: DemandMatrixData) {
    return DemandMatrixService.getMatrixSummary(data);
  }

  /**
   * Clear all caches
   */
  static clearCaches(): void {
    DemandMatrixService.clearCache();
    debugLog('All demand data caches cleared');
  }
}
