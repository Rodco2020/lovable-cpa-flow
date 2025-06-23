import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { debugLog } from './logger';
import { DemandMatrixData, DemandMatrixMode, DemandFilters } from '@/types/demand';
import { ForecastGenerator, DataFetcher, MatrixTransformer } from './demand';
import { revenueValidationService } from './validation/RevenueValidationService';
import { errorHandlingService } from './validation/ErrorHandlingService';

/**
 * Demand Matrix Service
 * Core engine for generating demand matrix forecasts with enhanced validation and error handling
 */
export class DemandMatrixService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static cache = new Map<string, { data: DemandMatrixData; timestamp: number }>();

  /**
   * Generate demand matrix forecast with comprehensive error handling
   */
  static async generateDemandMatrix(
    mode: DemandMatrixMode = 'demand-only',
    startDate: Date = new Date()
  ): Promise<{ matrixData: DemandMatrixData }> {
    const context = {
      operation: 'generateDemandMatrix',
      component: 'DemandMatrixService',
      timestamp: new Date()
    };

    debugLog('Generating demand matrix with enhanced validation', { mode, startDate });

    try {
      // Check cache first
      const cacheKey = this.getDemandMatrixCacheKey(mode, startDate);
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        debugLog('Using cached demand matrix data');
        // Validate cached data before returning
        const validationResult = revenueValidationService.validateRevenueData(cached);
        if (!validationResult.isValid && validationResult.errors.length > 0) {
          console.warn('Cached data failed validation, regenerating...', validationResult.errors);
          this.cache.delete(cacheKey); // Remove invalid cached data
        } else {
          return { matrixData: cached };
        }
      }

      // Generate exactly 12-month forecast range
      const monthStart = startOfMonth(startDate);
      const endDate = addMonths(monthStart, 11);
      const monthEnd = endOfMonth(endDate);
      
      // Create demand forecast parameters
      const parameters = {
        timeHorizon: 'year' as const,
        dateRange: {
          startDate: monthStart,
          endDate: monthEnd
        },
        includeSkills: 'all' as const,
        includeClients: 'all' as const,
        granularity: 'monthly' as const
      };

      debugLog('Date range for 12-month matrix', { 
        startDate: monthStart.toISOString(), 
        endDate: monthEnd.toISOString(),
        monthsDifference: (monthEnd.getFullYear() - monthStart.getFullYear()) * 12 + (monthEnd.getMonth() - monthStart.getMonth()) + 1
      });

      // Generate forecast data with error handling
      let forecastData;
      try {
        forecastData = await ForecastGenerator.generateDemandForecast(parameters);
      } catch (error) {
        const recovery = errorHandlingService.handleError(
          error as Error,
          { ...context, operation: 'generateDemandForecast' }
        );
        
        if (!recovery.success) {
          throw new Error(`Forecast generation failed: ${recovery.message}`);
        }
        
        // Use recovery data if available
        forecastData = recovery.fallbackValue || [];
      }
      
      // Fetch tasks for matrix transformation with error handling
      const filters: DemandFilters = {
        skills: [],
        clients: [],
        timeHorizon: {
          start: parameters.dateRange.startDate,
          end: parameters.dateRange.endDate
        }
      };
      
      let tasks;
      try {
        tasks = await DataFetcher.fetchClientAssignedTasks(filters);
      } catch (error) {
        const recovery = errorHandlingService.handleError(
          error as Error,
          { ...context, operation: 'fetchClientAssignedTasks' }
        );
        
        if (!recovery.success) {
          console.warn('Tasks fetch failed, continuing with empty array:', recovery.message);
        }
        
        tasks = recovery.fallbackValue || [];
      }
      
      // Transform to matrix format with error handling
      let matrixData;
      try {
        matrixData = await MatrixTransformer.transformToMatrixData(forecastData, tasks);
      } catch (error) {
        const recovery = errorHandlingService.handleError(
          error as Error,
          { ...context, operation: 'transformToMatrixData' }
        );
        
        if (!recovery.success) {
          throw new Error(`Matrix transformation failed: ${recovery.message}`);
        }
        
        matrixData = recovery.fallbackValue;
      }
      
      // Enhanced validation with revenue-specific rules
      const validationIssues = this.validateDemandMatrixData(matrixData);
      const revenueValidation = revenueValidationService.validateRevenueData(matrixData, {
        strictMode: false,
        allowFallbackRates: true
      });

      // Log validation results
      if (validationIssues.length > 0) {
        console.warn('Standard validation issues:', validationIssues);
      }
      
      if (!revenueValidation.isValid) {
        console.warn('Revenue validation issues:', revenueValidation);
        
        // Handle critical errors
        if (revenueValidation.errors.length > 0) {
          const criticalErrors = revenueValidation.errors.filter(error => 
            error.includes('negative revenue') || 
            error.includes('calculation failed') ||
            error.includes('critical')
          );
          
          if (criticalErrors.length > 0) {
            throw new Error(`Critical revenue validation errors: ${criticalErrors.join(', ')}`);
          }
        }
      }

      // Cache the result if validation passed
      if (validationIssues.length === 0 && revenueValidation.isValid) {
        this.setCachedData(cacheKey, matrixData);
      }
      
      debugLog(`Generated demand matrix with ${matrixData.dataPoints.length} data points and ${matrixData.months.length} months`);
      debugLog('Revenue validation summary', {
        isValid: revenueValidation.isValid,
        errors: revenueValidation.errors.length,
        warnings: revenueValidation.warnings.length,
        missingSkillRates: revenueValidation.missingSkillRates.length
      });

      return { matrixData };

    } catch (error) {
      console.error('Error generating demand matrix:', error);
      
      const recovery = errorHandlingService.handleError(
        error as Error,
        context,
        true // Attempt recovery
      );
      
      if (recovery.success && recovery.fallbackValue) {
        console.warn('Using recovery data for demand matrix');
        return { matrixData: recovery.fallbackValue };
      }
      
      throw new Error(`Demand matrix generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhanced validation with revenue-specific rules
   */
  static validateDemandMatrixData(matrixData: DemandMatrixData): string[] {
    const issues: string[] = [];

    try {
      // Standard validation rules
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

      // Enhanced data point validation
      let negativeHoursCount = 0;
      let nullTaskCount = 0;
      let invalidClientCount = 0;
      let revenueConsistencyIssues = 0;

      matrixData.dataPoints.forEach((point, index) => {
        // Standard validations
        if (point.demandHours < 0) {
          negativeHoursCount++;
        }

        if (point.taskCount < 0) {
          nullTaskCount++;
        }

        if (point.clientCount < 0) {
          invalidClientCount++;
        }

        // Enhanced task breakdown validation
        if (point.taskBreakdown) {
          point.taskBreakdown.forEach(task => {
            if (!task.clientId || !task.taskName) {
              issues.push(`Invalid task breakdown data for ${point.skillType} in ${point.month} (index ${index})`);
            }

            if (task.estimatedHours <= 0) {
              issues.push(`Invalid estimated hours for task ${task.taskName} in ${point.month}: ${task.estimatedHours}`);
            }

            // NEW: Revenue-related validations
            if (task.monthlyHours < 0) {
              issues.push(`Negative monthly hours for task ${task.taskName} in ${point.month}: ${task.monthlyHours}`);
            }

            if (task.skillType !== point.skillType) {
              issues.push(`Skill type mismatch in task breakdown for ${point.month}: expected ${point.skillType}, got ${task.skillType}`);
            }
          });

          // Validate task breakdown totals match data point totals
          const totalTaskHours = point.taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
          if (Math.abs(totalTaskHours - point.demandHours) > 0.01) {
            revenueConsistencyIssues++;
          }
        }
      });

      // Report validation issues
      if (negativeHoursCount > 0) {
        issues.push(`Found ${negativeHoursCount} data points with negative demand hours`);
      }

      if (nullTaskCount > 0) {
        issues.push(`Found ${nullTaskCount} data points with invalid task counts`);
      }

      if (invalidClientCount > 0) {
        issues.push(`Found ${invalidClientCount} data points with invalid client counts`);
      }

      if (revenueConsistencyIssues > 0) {
        issues.push(`Found ${revenueConsistencyIssues} data points with inconsistent task breakdown totals`);
      }

      // Enhanced summary validation
      const calculatedTotal = matrixData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const summaryTotal = matrixData.totalDemand;
      
      if (Math.abs(calculatedTotal - summaryTotal) > 0.01) {
        issues.push(`Total demand mismatch: calculated ${calculatedTotal}, summary ${summaryTotal}`);
      }

      // NEW: Revenue-specific validations
      if (matrixData.clientRevenue) {
        const negativeRevenueClients = Array.from(matrixData.clientRevenue.entries())
          .filter(([_, revenue]) => revenue < 0);
        
        if (negativeRevenueClients.length > 0) {
          issues.push(`Found ${negativeRevenueClients.length} clients with negative expected revenue`);
        }
      }

      if (matrixData.clientSuggestedRevenue) {
        const negativeSuggestedClients = Array.from(matrixData.clientSuggestedRevenue.entries())
          .filter(([_, revenue]) => revenue < 0);
        
        if (negativeSuggestedClients.length > 0) {
          issues.push(`Found ${negativeSuggestedClients.length} clients with negative suggested revenue`);
        }
      }

      // Validate skill fee rates if present
      if (matrixData.skillFeeRates) {
        const invalidFeeRates = Array.from(matrixData.skillFeeRates.entries())
          .filter(([_, rate]) => rate <= 0);
        
        if (invalidFeeRates.length > 0) {
          issues.push(`Found ${invalidFeeRates.length} skills with invalid fee rates (must be positive)`);
        }
      }

    } catch (error) {
      console.error('Error during validation:', error);
      issues.push(`Validation process error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
