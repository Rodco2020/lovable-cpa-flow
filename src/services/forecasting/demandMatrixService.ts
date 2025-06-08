
import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { debugLog } from './logger';
import { DemandMatrixData, DemandMatrixMode, DemandFilters } from '@/types/demand';
import { ForecastGenerator, DataFetcher, MatrixTransformer } from './demand';

/**
 * Demand Matrix Service
 * Core engine for generating demand matrix forecasts following the same patterns as capacity matrix
 */
export class DemandMatrixService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static cache = new Map<string, { data: DemandMatrixData; timestamp: number }>();

  /**
   * Generate demand matrix forecast following existing generateMatrixForecast pattern
   */
  static async generateDemandMatrix(
    mode: DemandMatrixMode = 'demand-only',
    startDate: Date = new Date()
  ): Promise<{ matrixData: DemandMatrixData }> {
    debugLog('Generating demand matrix', { mode, startDate });

    try {
      // Check cache first
      const cacheKey = this.getDemandMatrixCacheKey(mode, startDate);
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        debugLog('Using cached demand matrix data');
        return { matrixData: cached };
      }

      // Generate 12-month forecast range
      const endDate = addMonths(startOfMonth(startDate), 12);
      
      // Create demand forecast parameters
      const parameters = {
        timeHorizon: 'year' as const,
        dateRange: {
          startDate: startOfMonth(startDate),
          endDate: endOfMonth(endDate)
        },
        includeSkills: 'all' as const,
        includeClients: 'all' as const,
        granularity: 'monthly' as const
      };

      // Generate forecast data using existing demand services
      const forecastData = await ForecastGenerator.generateDemandForecast(parameters);
      
      // Fetch tasks for matrix transformation
      const filters: DemandFilters = {
        skills: [],
        clients: [],
        timeHorizon: {
          start: parameters.dateRange.startDate,
          end: parameters.dateRange.endDate
        }
      };
      
      const tasks = await DataFetcher.fetchClientAssignedTasks(filters);
      
      // Transform to matrix format
      const matrixData = MatrixTransformer.transformToMatrixData(forecastData, tasks);
      
      // Validate the generated data
      const validationIssues = this.validateDemandMatrixData(matrixData);
      if (validationIssues.length > 0) {
        console.warn('Demand matrix validation issues:', validationIssues);
      }

      // Cache the result
      this.setCachedData(cacheKey, matrixData);
      
      debugLog(`Generated demand matrix with ${matrixData.dataPoints.length} data points`);
      return { matrixData };

    } catch (error) {
      console.error('Error generating demand matrix:', error);
      throw new Error(`Demand matrix generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate demand matrix data with demand-specific rules
   */
  static validateDemandMatrixData(matrixData: DemandMatrixData): string[] {
    const issues: string[] = [];

    // Check for required structure
    if (!matrixData.months || matrixData.months.length !== 12) {
      issues.push(`Expected 12 months, got ${matrixData.months?.length || 0}`);
    }

    if (!matrixData.skills || matrixData.skills.length === 0) {
      issues.push('No skills found in demand matrix data');
    }

    if (!matrixData.dataPoints) {
      issues.push('No data points found in demand matrix');
      return issues;
    }

    // Validate data points
    let negativeHoursCount = 0;
    let nullTaskCount = 0;
    let invalidClientCount = 0;

    matrixData.dataPoints.forEach(point => {
      // Check for negative or invalid hours
      if (point.demandHours < 0) {
        negativeHoursCount++;
      }

      // Check for null task counts
      if (point.taskCount < 0) {
        nullTaskCount++;
      }

      // Check for invalid client counts
      if (point.clientCount < 0) {
        invalidClientCount++;
      }

      // Validate task breakdown
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach(task => {
          if (!task.clientId || !task.taskName) {
            issues.push(`Invalid task breakdown data for ${point.skillType} in ${point.month}`);
          }

          if (task.estimatedHours <= 0) {
            issues.push(`Invalid estimated hours for task ${task.taskName} in ${point.month}`);
          }
        });
      }
    });

    if (negativeHoursCount > 0) {
      issues.push(`Found ${negativeHoursCount} data points with negative demand hours`);
    }

    if (nullTaskCount > 0) {
      issues.push(`Found ${nullTaskCount} data points with invalid task counts`);
    }

    if (invalidClientCount > 0) {
      issues.push(`Found ${invalidClientCount} data points with invalid client counts`);
    }

    // Validate summary data consistency
    const calculatedTotal = matrixData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
    const summaryTotal = matrixData.totalDemand;
    
    if (Math.abs(calculatedTotal - summaryTotal) > 0.01) {
      issues.push(`Total demand mismatch: calculated ${calculatedTotal}, summary ${summaryTotal}`);
    }

    return issues;
  }

  /**
   * Get demand matrix cache key
   */
  static getDemandMatrixCacheKey(mode: DemandMatrixMode, startDate: Date): string {
    return `demand_matrix_${mode}_${format(startDate, 'yyyy-MM')}`;
  }

  /**
   * Get cached demand matrix data
   */
  private static getCachedData(cacheKey: string): DemandMatrixData | null {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache demand matrix data
   */
  private static setCachedData(cacheKey: string, data: DemandMatrixData): void {
    // Simple LRU: remove oldest if cache is getting large
    if (this.cache.size >= 10) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear demand matrix cache
   */
  static clearCache(): void {
    this.cache.clear();
    debugLog('Demand matrix cache cleared');
  }
}
