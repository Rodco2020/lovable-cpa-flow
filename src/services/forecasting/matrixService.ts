
import { MatrixServiceCore } from './matrix/MatrixServiceCore';
import { MatrixCacheManager } from './matrix/MatrixCacheManager';
import { MatrixValidator } from './matrix/MatrixValidator';
import { 
  MatrixData, 
  MatrixDataPoint, 
  ForecastType, 
  MatrixValidationResult 
} from './matrix/types';

/**
 * Matrix Service - Public API
 * UNIFIED: Now uses refactored core services for improved maintainability
 * 
 * This service maintains the exact same public interface while using
 * the new refactored internal architecture for better code organization.
 */

// Re-export types for backward compatibility
export type { MatrixDataPoint };

/**
 * Generate matrix forecast data
 * UNIFIED: Now uses MatrixServiceCore with unified demand pipeline
 */
export async function generateMatrixForecast(
  forecastType: ForecastType = 'virtual'
): Promise<{ matrixData: MatrixData }> {
  return MatrixServiceCore.generateMatrixForecast(forecastType, true);
}

/**
 * Validate matrix data integrity
 */
export function validateMatrixData(matrixData: MatrixData): string[] {
  const validation: MatrixValidationResult = MatrixValidator.validateMatrixData(matrixData);
  return validation.issues;
}

/**
 * Get matrix cache key for caching
 */
export function getMatrixCacheKey(forecastType: ForecastType, startDate: Date): string {
  return MatrixCacheManager.getCacheKey(forecastType, startDate);
}

/**
 * Clear matrix cache
 */
export function clearMatrixCache(): void {
  MatrixServiceCore.clearCache();
}

/**
 * Get cache statistics
 */
export function getMatrixCacheStats() {
  return MatrixServiceCore.getCacheStats();
}
