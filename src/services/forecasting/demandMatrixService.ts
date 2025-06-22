
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { debugLog } from './logger';
import { MatrixTransformer } from './demand/matrixTransformer';
import { DataFetcher } from './demand/dataFetcher';
import { DemandMatrixValidator } from './demand/validation/demandMatrixValidator';
import { getErrorMessage } from '@/utils/errorUtils';

/**
 * Demand Matrix Service
 * 
 * Core service for managing demand matrix operations including data fetching,
 * transformation, validation, and filtering.
 */
export class DemandMatrixService {
  private static cache = new Map<string, DemandMatrixData>();

  /**
   * Generate demand matrix with comprehensive data processing
   */
  static async generateDemandMatrix(
    filters: DemandFilters = {}
  ): Promise<DemandMatrixData> {
    debugLog('Generating demand matrix', { filters });

    try {
      // Fetch client-assigned tasks based on filters
      const tasks = await DataFetcher.fetchClientAssignedTasks(filters);
      
      if (tasks.length === 0) {
        debugLog('No tasks found matching filters');
        return this.createEmptyMatrix();
      }

      // Generate forecast data for the next 12 months
      const { ForecastGenerator } = await import('./demand/forecastGenerator');
      const startDate = new Date();
      const endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), 0);
      
      const forecastData = await ForecastGenerator.generateDemandForecast({
        dateRange: { startDate, endDate },
        includeSkills: filters.skillTypes || 'all',
        includeClients: filters.clientIds || 'all'
      });

      // Transform to matrix format
      const matrixData = await MatrixTransformer.transformToMatrixData(
        forecastData,
        tasks
      );

      // Validate the generated matrix
      const validationResult = DemandMatrixValidator.validateDemandMatrix(matrixData);
      if (!validationResult.isValid) {
        debugLog('Matrix validation failed', { 
          issues: validationResult.issues 
        });
      }

      debugLog('Demand matrix generated successfully', {
        totalDataPoints: matrixData.dataPoints.length,
        totalDemand: matrixData.totalDemand,
        monthsCount: matrixData.months.length
      });

      return matrixData;

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      debugLog('Error generating demand matrix', { error: errorMessage });
      return this.createEmptyMatrix();
    }
  }

  /**
   * Validate demand matrix data
   */
  static validateMatrix(data: DemandMatrixData): { isValid: boolean; issues: string[] } {
    try {
      const validationResult = DemandMatrixValidator.validateDemandMatrix(data);
      return {
        isValid: validationResult.isValid,
        issues: validationResult.issues
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      debugLog('Error validating matrix', { error: errorMessage });
      return {
        isValid: false,
        issues: ['Validation failed due to unexpected error']
      };
    }
  }

  /**
   * Apply enhanced filtering to demand matrix data
   */
  static async applyFiltering(
    data: DemandMatrixData,
    filters: DemandFilters
  ): Promise<DemandMatrixData> {
    debugLog('Applying enhanced filtering', { filters });

    try {
      // Use the enhanced data filter for comprehensive filtering
      const { EnhancedDataFilter } = await import('./demand/enhancedDataFilter');
      
      const result = await EnhancedDataFilter.executeComprehensiveFiltering(
        data,
        filters,
        {
          enableValidation: true,
          enablePerformanceMonitoring: true,
          enableLogging: true,
          fallbackOnError: true
        }
      );

      if (!result.success) {
        debugLog('Filtering failed, using fallback', { 
          errors: result.errors 
        });
        return data; // Return original data as fallback
      }

      return result.filteredData;

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      debugLog('Error applying filtering', { error: errorMessage });
      return data; // Return original data on error
    }
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
    debugLog('Matrix cache cleared');
  }

  /**
   * Validate demand matrix data structure
   */
  static validateDemandMatrixData(data: DemandMatrixData): { isValid: boolean; issues: string[] } {
    return this.validateMatrix(data);
  }

  /**
   * Get cache key for demand matrix
   */
  static getDemandMatrixCacheKey(filters: DemandFilters): string {
    return JSON.stringify(filters);
  }

  /**
   * Create empty matrix structure
   */
  private static createEmptyMatrix(): DemandMatrixData {
    return {
      months: [],
      skills: [],
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: [],
      availableClients: [],
      availablePreferredStaff: []
    };
  }

  /**
   * Get matrix summary statistics
   */
  static getMatrixSummary(data: DemandMatrixData): {
    totalHours: number;
    totalTasks: number;
    totalClients: number;
    skillsCount: number;
    monthsCount: number;
    averageHoursPerMonth: number;
  } {
    const averageHoursPerMonth = data.months.length > 0 
      ? data.totalDemand / data.months.length 
      : 0;

    return {
      totalHours: data.totalDemand,
      totalTasks: data.totalTasks,
      totalClients: data.totalClients,
      skillsCount: data.skills.length,
      monthsCount: data.months.length,
      averageHoursPerMonth
    };
  }
}
