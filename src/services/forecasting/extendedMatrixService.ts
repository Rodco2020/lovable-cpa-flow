
import { debugLog } from './logger';
import { MatrixData } from './matrixUtils';
import { DemandMatrixData } from '@/types/demand';
import { generateMatrixForecast } from './matrixService';
import { DemandMatrixService } from './demandMatrixService';

/**
 * Extended Matrix Service
 * Provides unified interface for both capacity and demand matrix generation
 */
export class ExtendedMatrixService {
  /**
   * Generate matrix forecast supporting both capacity and demand modes
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
    debugLog('Generating unified matrix', { matrixType, forecastType, startDate });

    try {
      if (matrixType === 'capacity') {
        // Use existing capacity matrix service
        const { matrixData } = await generateMatrixForecast(forecastType, startDate);
        
        return {
          matrixData,
          matrixType: 'capacity'
        };
      } else {
        // Use new demand matrix service
        const { matrixData: demandMatrixData } = await DemandMatrixService.generateDemandMatrix(
          'demand-only',
          startDate
        );
        
        return {
          demandMatrixData,
          matrixType: 'demand'
        };
      }
    } catch (error) {
      console.error(`Error generating ${matrixType} matrix:`, error);
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
      // Use existing validation from matrixService
      const { validateMatrixData } = require('./matrixService');
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
      const { getMatrixCacheKey } = require('./matrixService');
      return getMatrixCacheKey(forecastType as 'virtual' | 'actual', startDate);
    } else {
      return DemandMatrixService.getDemandMatrixCacheKey('demand-only', startDate);
    }
  }
}
