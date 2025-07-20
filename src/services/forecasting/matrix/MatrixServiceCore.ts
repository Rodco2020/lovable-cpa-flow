import { MatrixData, MatrixDataPoint, ForecastType } from './types';
import { MatrixDataProcessor } from './MatrixDataProcessor';
import { SkillAwareForecastingService } from '../skillAwareForecastingService';
import { addMonths, format, startOfMonth } from 'date-fns';

/**
 * Matrix Service Core - Enhanced with Availability-Based Capacity
 * 
 * Now integrates with the enhanced availability-based capacity calculation
 * while maintaining the exact same public interface.
 */
export class MatrixServiceCore {
  private static cache = new Map<string, { data: MatrixData; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate matrix forecast data with enhanced availability-based capacity
   */
  static async generateMatrixForecast(
    forecastType: ForecastType = 'virtual',
    useCache: boolean = true
  ): Promise<{ matrixData: MatrixData }> {
    const cacheKey = this.getCacheKey(forecastType);
    
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('🚀 [MATRIX SERVICE] Using cached matrix data with availability-based capacity');
        return { matrixData: cached.data };
      }
    }

    try {
      console.log('🔄 [MATRIX SERVICE] Generating matrix with ENHANCED availability-based capacity...');
      
      const startDate = startOfMonth(new Date());
      const endDate = addMonths(startDate, 12);

      // Generate demand forecast (unchanged)
      const demandForecast = await SkillAwareForecastingService.generateDemandForecast(startDate, endDate);
      
      // Generate ENHANCED capacity forecast using availability data
      const capacityForecast = await SkillAwareForecastingService.generateCapacityForecast(startDate, endDate);

      // Merge demand and capacity data
      const mergedForecast = this.mergeDemandAndCapacity(demandForecast, capacityForecast);

      // Transform to matrix format
      const matrixData = MatrixDataProcessor.transformForecastDataToMatrix(mergedForecast);

      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, {
          data: matrixData,
          timestamp: Date.now()
        });
      }

      console.log('✅ [MATRIX SERVICE] Matrix generation complete with availability-based capacity:', {
        totalSkills: matrixData.skills.length,
        totalMonths: matrixData.months.length,
        dataPointsCount: matrixData.dataPoints.length,
        totalDemand: matrixData.totalDemand,
        totalCapacity: matrixData.totalCapacity,
        capacitySource: 'Staff Availability Matrix'
      });

      return { matrixData };

    } catch (error) {
      console.error('❌ [MATRIX SERVICE] Error generating matrix with availability-based capacity:', error);
      throw error;
    }
  }

  /**
   * Merge demand and capacity forecasts
   */
  private static mergeDemandAndCapacity(
    demandForecast: any[],
    capacityForecast: any[]
  ): any[] {
    const merged: any[] = [];

    // Create a map of capacity data by period
    const capacityMap = new Map();
    capacityForecast.forEach(period => {
      capacityMap.set(period.period, period);
    });

    // Merge demand with corresponding capacity
    demandForecast.forEach(demandPeriod => {
      const capacityPeriod = capacityMap.get(demandPeriod.period);
      
      merged.push({
        ...demandPeriod,
        capacity: capacityPeriod ? capacityPeriod.capacity : [],
        capacityHours: capacityPeriod ? capacityPeriod.capacityHours : 0
      });
    });

    return merged;
  }

  /**
   * Get cache key for caching
   */
  private static getCacheKey(forecastType: ForecastType): string {
    const startDate = startOfMonth(new Date());
    return `matrix-${forecastType}-${format(startDate, 'yyyy-MM')}-availability-enhanced`;
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
    console.log('🗑️ [MATRIX SERVICE] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      ttl: this.CACHE_TTL
    };
  }
}
