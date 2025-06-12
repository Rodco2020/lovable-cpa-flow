
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
 * FIXED: Now uses corrected demand calculation logic
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
 * FIXED: Now properly combines demand and capacity with corrected calculations
 */
export async function generateMatrixForecast(forecastType: 'virtual' | 'actual'): Promise<{ matrixData: MatrixData }> {
  debugLog(`Generating matrix forecast (${forecastType}) with FIXED demand calculation`);
  
  try {
    const currentYear = new Date().getFullYear();
    const startDate = startOfYear(new Date(currentYear, 0, 1));
    const endDate = new Date(currentYear, 11, 31);

    // Use demand matrix service to obtain demand data via MatrixTransformerCore
    const { matrixData: demandMatrix } = await DemandMatrixService.generateDemandMatrix(
      'demand-only',
      startDate
    );

    // Generate capacity forecast using skill-aware service
    const capacityForecast = await SkillAwareForecastingService.generateCapacityForecast(
      startDate,
      endDate
    );

    const months: MonthInfo[] = demandMatrix.months;

    // Build demand map by month and skill for quick lookup
    const demandByMonth = new Map<string, Map<SkillType, number>>();
    demandMatrix.dataPoints.forEach(dp => {
      const monthMap = demandByMonth.get(dp.month) || new Map<SkillType, number>();
      monthMap.set(dp.skillType as SkillType, (monthMap.get(dp.skillType as SkillType) || 0) + dp.demandHours);
      demandByMonth.set(dp.month, monthMap);
    });

    // Construct ForecastData array combining demand from demand matrix and capacity forecast
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
    
    debugLog('FIXED Matrix data generated:', {
      months: matrixData.months.length,
      skills: matrixData.skills.length,
      dataPoints: matrixData.dataPoints.length,
      totalDemand: matrixData.totalDemand,
      totalCapacity: matrixData.totalCapacity,
      totalGap: matrixData.totalGap,
      sampleDataPoints: matrixData.dataPoints.slice(0, 5)
    });
    
    // Validate the generated data
    const validationIssues = validateMatrixData(matrixData);
    if (validationIssues.length > 0) {
      console.warn('Matrix validation issues (after FIX):', validationIssues);
    }
    
    return { matrixData };
    
  } catch (error) {
    console.error('Error generating matrix forecast (FIXED):', error);
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
