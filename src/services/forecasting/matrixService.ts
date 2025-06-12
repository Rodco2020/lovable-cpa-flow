
import {
  MatrixData,
  MonthInfo,
  transformForecastDataToMatrix
} from './matrixUtils';
import { SkillAwareForecastingService } from './skillAwareForecastingService';
import { DemandMatrixService } from './demandMatrixService';
import { startOfYear } from 'date-fns';
import { SkillType } from '@/types/task';
import { debugLog } from './logger';

/**
 * Matrix Service - Core matrix data generation
 * UNIFIED: Now uses same demand pipeline as Demand Forecast Matrix
 */

export interface MatrixDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercent: number;
}

/**
 * Generate matrix forecast data
 * UNIFIED: Now uses DemandMatrixService for consistent demand data
 */
export async function generateMatrixForecast(forecastType: 'virtual' | 'actual'): Promise<{ matrixData: MatrixData }> {
  debugLog(`Generating UNIFIED matrix forecast (${forecastType}) using DemandMatrixService`);
  
  try {
    const currentYear = new Date().getFullYear();
    const startDate = startOfYear(new Date(currentYear, 0, 1));
    const endDate = new Date(currentYear, 11, 31);

    // UNIFIED: Use DemandMatrixService for demand data (same as Demand Forecast Matrix)
    const { matrixData: demandMatrix } = await DemandMatrixService.generateDemandMatrix(
      'demand-only',
      startDate
    );

    // Generate capacity forecast using existing skill-aware service
    const capacityForecast = await SkillAwareForecastingService.generateCapacityForecast(
      startDate,
      endDate
    );

    const months: MonthInfo[] = demandMatrix.months;

    // Build demand map by month and skill from unified demand matrix
    const demandByMonth = new Map<string, Map<SkillType, number>>();
    demandMatrix.dataPoints.forEach(dp => {
      const monthMap = demandByMonth.get(dp.month) || new Map<SkillType, number>();
      monthMap.set(dp.skillType as SkillType, (monthMap.get(dp.skillType as SkillType) || 0) + dp.demandHours);
      demandByMonth.set(dp.month, monthMap);
    });

    // Construct ForecastData array combining unified demand and capacity
    const combinedForecast = months.map(month => {
      const demandMap = demandByMonth.get(month.key) || new Map<SkillType, number>();
      const demand = Array.from(demandMap.entries()).map(([skill, hours]) => ({ skill, hours }));
      const capacityPeriod = capacityForecast.find(p => p.period === month.key);
      const capacity = capacityPeriod?.capacity || [];

      return {
        period: month.key,
        demand,
        capacity
      };
    });

    // Transform combined forecast into matrix data structure
    const matrixData: MatrixData = transformForecastDataToMatrix(combinedForecast);
    
    debugLog('UNIFIED Matrix data generated:', {
      months: matrixData.months.length,
      skills: matrixData.skills.length,
      dataPoints: matrixData.dataPoints.length,
      totalDemand: matrixData.totalDemand,
      totalCapacity: matrixData.totalCapacity,
      totalGap: matrixData.totalGap,
      demandSource: 'DemandMatrixService (UNIFIED)',
      capacitySource: 'SkillAwareForecastingService',
      sampleDataPoints: matrixData.dataPoints.slice(0, 5)
    });
    
    // Validate the generated data
    const validationIssues = validateMatrixData(matrixData);
    if (validationIssues.length > 0) {
      console.warn('UNIFIED Matrix validation issues:', validationIssues);
    }
    
    return { matrixData };
    
  } catch (error) {
    console.error('Error generating UNIFIED matrix forecast:', error);
    throw error;
  }
}

/**
 * Validate matrix data integrity
 */
export function validateMatrixData(matrixData: MatrixData): string[] {
  const issues: string[] = [];
  
  if (!matrixData.months || matrixData.months.length === 0) {
    issues.push('No months data available');
  }
  
  if (!matrixData.skills || matrixData.skills.length === 0) {
    issues.push('No skills data available');
  }
  
  if (!matrixData.dataPoints || matrixData.dataPoints.length === 0) {
    issues.push('No data points available');
  }
  
  // Check for expected number of data points (12 months × skills count)
  const expectedDataPoints = matrixData.months.length * matrixData.skills.length;
  if (matrixData.dataPoints.length !== expectedDataPoints) {
    issues.push(`Expected ${expectedDataPoints} data points, but found ${matrixData.dataPoints.length}`);
  }
  
  // Check for negative values
  const negativeHours = matrixData.dataPoints.filter(dp => dp.demandHours < 0 || dp.capacityHours < 0);
  if (negativeHours.length > 0) {
    issues.push(`Found ${negativeHours.length} data points with negative hours`);
  }
  
  return issues;
}

/**
 * Get matrix cache key for caching
 */
export function getMatrixCacheKey(forecastType: 'virtual' | 'actual', startDate: Date): string {
  const year = startDate.getFullYear();
  const month = startDate.getMonth() + 1;
  return `unified_matrix_${forecastType}_${year}_${month.toString().padStart(2, '0')}`;
}
