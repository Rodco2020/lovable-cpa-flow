
import { debugLog } from './logger';
import { MatrixData } from './matrixUtils';
import { DemandMatrixData } from '@/types/demand';
import { generateMatrixForecast, validateMatrixData, getMatrixCacheKey } from './matrixService';
import { DemandMatrixService } from './demandMatrixService';

/**
 * Extended Matrix Service
 * Provides unified interface for both capacity and demand matrix generation
 * UNIFIED: Now supports consistent data sources across all matrix types
 */
export class ExtendedMatrixService {
  /**
   * Generate matrix forecast supporting both capacity and demand modes
   * UNIFIED: Capacity mode now uses same demand pipeline as demand mode
   */
  static async generateUnifiedMatrix(
    matrixType: 'capacity' | 'demand',
    forecastType: 'virtual' | 'actual' = 'virtual',
    startDate: Date = new Date()
  ): Promise<{
    matrixData?: MatrixData;
    demandMatrixData?: DemandMatrixData;
    matrixType: 'capacity' | 'demand';
  }> {
    debugLog('Generating UNIFIED matrix', { matrixType, forecastType, startDate });

    try {
      if (matrixType === 'capacity') {
        // UNIFIED: Use updated generateMatrixForecast with unified demand pipeline
        const { matrixData } = await generateMatrixForecast(forecastType);
        
        return {
          matrixData,
          matrixType: 'capacity'
        };
      } else {
        // Use new demand matrix service - pass undefined for filters since we don't have any in this context
        const { matrixData: demandMatrixData } = await DemandMatrixService.generateDemandMatrix(
          'demand-only',
          undefined // No active filters for this unified matrix generation
        );
        
        return {
          demandMatrixData,
          matrixType: 'demand'
        };
      }
    } catch (error) {
      console.error(`Error generating UNIFIED ${matrixType} matrix:`, error);
      throw new Error(`${matrixType} matrix generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate matrix data based on type
   */
  static validateMatrixData(
    matrixData: MatrixData | DemandMatrixData,
    matrixType: 'capacity' | 'demand'
  ): string[] {
    if (matrixType === 'capacity') {
      // Use unified validation from matrixService
      return validateMatrixData(matrixData as MatrixData);
    } else {
      // Use demand-specific validation
      return DemandMatrixService.validateDemandMatrixData(matrixData as DemandMatrixData);
    }
  }

  /**
   * Get appropriate cache key based on matrix type
   */
  static getCacheKey(
    matrixType: 'capacity' | 'demand',
    forecastType: 'virtual' | 'actual' | 'demand-only',
    startDate: Date
  ): string {
    if (matrixType === 'capacity') {
      return getMatrixCacheKey(forecastType as 'virtual' | 'actual', startDate);
    } else {
      return DemandMatrixService.getDemandMatrixCacheKey('demand-only', startDate);
    }
  }
}
