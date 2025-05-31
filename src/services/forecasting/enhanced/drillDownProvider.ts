
import { MatrixData } from '../matrixUtils';
import { AdvancedAnalyticsService, DrillDownData } from '../analyticsService';
import { EnhancedCacheManager } from './cacheManager';
import { SkillType } from '@/types/task';
import { debugLog } from '../logger';

/**
 * Drill Down Provider
 * Handles drill-down data retrieval with caching support
 */
export class DrillDownProvider {
  /**
   * Get drill-down data with caching support
   */
  static async getDrillDownData(
    skill: SkillType, 
    month: string,
    matrixData?: MatrixData
  ): Promise<DrillDownData> {
    debugLog(`Getting drill-down data for ${skill} in ${month}`);
    
    // Use provided matrix data or get from cache
    if (!matrixData) {
      const cached = this.findCachedMatrixData(skill);
      if (!cached) {
        throw new Error('No matrix data available for drill-down');
      }
      matrixData = cached.matrixData;
    }

    return AdvancedAnalyticsService.getDrillDownData(matrixData, skill, month);
  }

  /**
   * Find cached matrix data containing the specified skill
   */
  private static findCachedMatrixData(skill: SkillType) {
    const cacheStats = EnhancedCacheManager.getCacheStats();
    return cacheStats.entries.length > 0 ? 
      EnhancedCacheManager.getCachedResult('virtual', true) : null;
  }
}
