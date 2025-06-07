
/**
 * Matrix Cache Utilities
 * Handles cache key generation and management for matrix forecasts
 */
export class MatrixCacheUtils {
  /**
   * Cache key generator for matrix forecasts
   */
  static getMatrixCacheKey(
    forecastType: 'virtual' | 'actual',
    startDate: Date
  ): string {
    return `matrix_${forecastType}_${startDate.toISOString().slice(0, 7)}`;
  }

  /**
   * Generate cache key with additional parameters
   */
  static getDetailedCacheKey(
    forecastType: 'virtual' | 'actual',
    startDate: Date,
    skillsHash?: string
  ): string {
    const baseKey = this.getMatrixCacheKey(forecastType, startDate);
    return skillsHash ? `${baseKey}_${skillsHash}` : baseKey;
  }
}
