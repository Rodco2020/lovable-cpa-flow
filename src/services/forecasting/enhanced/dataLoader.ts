
import { MatrixData } from '../matrixUtils';
import { debugLog } from '../logger';

/**
 * Enhanced Matrix Data Loader
 * Now uses skill-aware forecasting for better data resolution
 */
export class MatrixDataLoader {
  /**
   * Load matrix data for specified forecast type with enhanced skill resolution
   */
  static async loadMatrixData(forecastType: 'virtual' | 'actual'): Promise<{ matrixData: MatrixData }> {
    debugLog('Loading matrix data with enhanced skill resolution', { forecastType });
    
    // Import the updated matrix service
    const { generateMatrixForecast } = await import('../matrixService');
    return generateMatrixForecast(forecastType);
  }
}
