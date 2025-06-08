
import { MatrixData } from '../matrixUtils';
import { debugLog } from '../logger';

interface MatrixLoadOptions {
  clientIds?: string[];
}

/**
 * Enhanced Matrix Data Loader (Phase 3: Client Filtering Enhanced)
 * Now supports client filtering through the matrix generation pipeline
 */
export class MatrixDataLoader {
  /**
   * Load matrix data for specified forecast type with client filtering support
   */
  static async loadMatrixData(
    forecastType: 'virtual' | 'actual',
    options?: MatrixLoadOptions
  ): Promise<{ matrixData: MatrixData }> {
    debugLog('Phase 3: Loading matrix data with client filtering support:', { 
      forecastType,
      hasClientFilter: !!options?.clientIds,
      clientCount: options?.clientIds?.length || 0,
      clientIds: options?.clientIds
    });
    
    // Import the updated matrix service
    const { generateMatrixForecast } = await import('../matrixService');
    
    // Pass client filtering options to matrix generation
    const matrixOptions = options?.clientIds ? { clientIds: options.clientIds } : undefined;
    
    return generateMatrixForecast(forecastType, new Date(), matrixOptions);
  }
}
