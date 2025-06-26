
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { debugLog } from '../logger';
import { DemandMatrixData, DemandMatrixMode, DemandFilters } from '@/types/demand';
import { ForecastGenerator, DataFetcher, MatrixTransformer } from '../demand';
import { revenueValidationService } from '../validation/RevenueValidationService';
import { errorHandlingService } from '../validation/ErrorHandlingService';
import { DemandMatrixCacheService } from './demandMatrixCacheService';
import { DemandMatrixValidationService } from './demandMatrixValidationService';

/**
 * Demand Matrix Orchestrator
 * Coordinates the entire demand matrix generation process
 */
export class DemandMatrixOrchestrator {
  /**
   * Generate demand matrix forecast with comprehensive error handling
   */
  static async generateDemandMatrix(
    mode: DemandMatrixMode = 'demand-only',
    startDate: Date = new Date()
  ): Promise<{ matrixData: DemandMatrixData }> {
    const context = {
      operation: 'generateDemandMatrix',
      component: 'DemandMatrixOrchestrator',
      timestamp: new Date()
    };

    debugLog('Generating demand matrix with enhanced validation', { mode, startDate });

    try {
      // Check cache first
      const cacheKey = DemandMatrixCacheService.getDemandMatrixCacheKey(mode, startDate);
      const cached = DemandMatrixCacheService.getCachedData(cacheKey);
      
      if (cached) {
        debugLog('Found cached demand matrix data, validating...');
        
        if (DemandMatrixValidationService.validateCachedData(cached)) {
          debugLog('Using cached demand matrix data');
          return { matrixData: cached };
        } else {
          console.warn('Cached data failed validation, regenerating...');
          DemandMatrixCacheService.clearCache();
        }
      }

      // Generate fresh data
      const matrixData = await this.generateFreshMatrixData(mode, startDate, context);

      // Cache the result if validation passes
      if (DemandMatrixValidationService.shouldCacheData(matrixData)) {
        DemandMatrixCacheService.setCachedData(cacheKey, matrixData);
      }

      debugLog(`Generated demand matrix with ${matrixData.dataPoints.length} data points and ${matrixData.months.length} months`);
      
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
   * Generate fresh matrix data without cache
   */
  private static async generateFreshMatrixData(
    mode: DemandMatrixMode,
    startDate: Date,
    context: any
  ): Promise<DemandMatrixData> {
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
      
      forecastData = recovery.fallbackValue || [];
    }
    
    // Fetch tasks for matrix transformation with error handling
    const filters: DemandFilters = {
      skills: [],
      clients: [],
      preferredStaff: [], // Phase 3: Add preferredStaff field
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
    const validationIssues = DemandMatrixValidationService.validateDemandMatrixData(matrixData);
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

    debugLog('Revenue validation summary', {
      isValid: revenueValidation.isValid,
      errors: revenueValidation.errors.length,
      warnings: revenueValidation.warnings.length,
      missingSkillRates: revenueValidation.missingSkillRates.length
    });

    return matrixData;
  }
}
