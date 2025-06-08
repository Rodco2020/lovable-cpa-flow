
import { debugLog } from './logger';
import { DemandDataService } from './demandDataService';
import { 
  DemandForecastParameters, 
  DemandMatrixData, 
  DemandForecastResult 
} from '@/types/demand';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Demand Matrix Service
 * Handles demand-specific matrix generation and validation
 */
export class DemandMatrixService {
  /**
   * Generate demand matrix forecast for 12-month display
   */
  static async generateDemandMatrix(
    forecastType: 'demand-only' = 'demand-only',
    startDate: Date = new Date()
  ): Promise<{ demandResult: DemandForecastResult; matrixData: DemandMatrixData }> {
    debugLog('Generating demand matrix', { forecastType, startDate });

    // Normalize start date to beginning of month
    const normalizedStartDate = startOfMonth(startDate);
    
    // Calculate end date (12 months from start)
    const endDate = endOfMonth(addMonths(normalizedStartDate, 11));

    try {
      // Create forecast parameters
      const parameters: DemandForecastParameters = {
        timeHorizon: 'custom',
        dateRange: {
          startDate: normalizedStartDate,
          endDate: endDate
        },
        includeSkills: 'all',
        includeClients: 'all',
        granularity: 'monthly'
      };

      // Generate demand forecast
      const demandForecastData = await DemandDataService.generateDemandForecast(parameters);

      // Fetch tasks for matrix transformation
      const tasks = await DemandDataService.fetchClientAssignedTasks({
        skills: [],
        clients: [],
        timeHorizon: {
          start: normalizedStartDate,
          end: endDate
        }
      });

      // Transform to matrix format
      const matrixData = DemandDataService.transformToMatrixData(demandForecastData, tasks);

      // Create result
      const demandResult: DemandForecastResult = {
        parameters,
        data: demandForecastData,
        demandMatrix: matrixData,
        summary: {
          totalDemand: matrixData.totalDemand,
          totalTasks: matrixData.totalTasks,
          totalClients: matrixData.totalClients,
          averageMonthlyDemand: matrixData.totalDemand / 12
        },
        generatedAt: new Date()
      };

      debugLog('Demand matrix generation complete', {
        periodsCount: demandForecastData.length,
        matrixMonths: matrixData.months.length,
        matrixSkills: matrixData.skills.length,
        dataPoints: matrixData.dataPoints.length,
        totalDemand: matrixData.totalDemand
      });

      return {
        demandResult,
        matrixData
      };
    } catch (error) {
      console.error('Error generating demand matrix:', error);
      throw new Error(`Demand matrix generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate demand matrix data integrity
   */
  static validateDemandMatrixData(matrixData: DemandMatrixData): string[] {
    const issues: string[] = [];

    // Check for expected number of months (should be 12)
    if (matrixData.months.length !== 12) {
      issues.push(`Expected 12 months, got ${matrixData.months.length}`);
    }

    // Check for minimum expected skills
    if (matrixData.skills.length === 0) {
      issues.push('No skills found in demand matrix data');
    }

    // Check for data completeness
    const expectedDataPoints = matrixData.months.length * matrixData.skills.length;
    if (matrixData.dataPoints.length !== expectedDataPoints) {
      issues.push(`Expected ${expectedDataPoints} data points, got ${matrixData.dataPoints.length}. Skills: ${matrixData.skills.length}, Months: ${matrixData.months.length}`);
    }

    // Check for skills consistency in data points
    const dataPointSkills = new Set(matrixData.dataPoints.map(point => point.skillType));
    const matrixSkillsSet = new Set(matrixData.skills);
    
    const missingSkillsInData = matrixData.skills.filter(skill => !dataPointSkills.has(skill));
    const extraSkillsInData = Array.from(dataPointSkills).filter(skill => !matrixSkillsSet.has(skill));
    
    if (missingSkillsInData.length > 0) {
      issues.push(`Skills missing from data points: ${missingSkillsInData.join(', ')}`);
    }
    
    if (extraSkillsInData.length > 0) {
      issues.push(`Extra skills in data points: ${extraSkillsInData.join(', ')}`);
    }

    // Check for negative values
    const negativeValues = matrixData.dataPoints.filter(
      point => point.demandHours < 0
    );
    if (negativeValues.length > 0) {
      issues.push(`Found ${negativeValues.length} data points with negative demand hours`);
    }

    // Check task breakdown integrity
    const invalidTaskBreakdowns = matrixData.dataPoints.filter(
      point => point.taskBreakdown.length === 0 && point.demandHours > 0
    );
    if (invalidTaskBreakdowns.length > 0) {
      issues.push(`Found ${invalidTaskBreakdowns.length} data points with demand hours but no task breakdown`);
    }

    return issues;
  }

  /**
   * Generate cache key for demand matrix
   */
  static getDemandMatrixCacheKey(
    forecastType: 'demand-only',
    startDate: Date
  ): string {
    return `demand_matrix_${forecastType}_${startDate.toISOString().slice(0, 7)}`;
  }
}
