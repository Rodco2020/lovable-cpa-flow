
import { MatrixData } from '../matrixUtils';
import { debugLog } from '../logger';

/**
 * Matrix Data Loader
 * Handles loading matrix data from various sources
 */
export class MatrixDataLoader {
  /**
   * Load matrix data for specified forecast type
   */
  static async loadMatrixData(forecastType: 'virtual' | 'actual'): Promise<{ matrixData: MatrixData }> {
    debugLog('Loading matrix data', { forecastType });
    
    // Import the matrix service here to avoid circular dependencies
    const { generateMatrixForecast } = await import('../matrixService');
    return generateMatrixForecast(forecastType);
  }
}
