
import { MatrixData, MonthInfo } from './matrixUtils';
import { SkillAwareForecastingService } from './skillAwareForecastingService';
import { startOfYear, addMonths, format } from 'date-fns';
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
    
    // Generate demand and capacity forecasts with FIXED logic
    const [demandForecast, capacityForecast] = await Promise.all([
      SkillAwareForecastingService.generateDemandForecast(startDate, endDate),
      SkillAwareForecastingService.generateCapacityForecast(startDate, endDate)
    ]);
    
    debugLog('FIXED Forecasts generated:', {
      demandPeriods: demandForecast.length,
      capacityPeriods: capacityForecast.length,
      sampleDemand: demandForecast[0]?.demand || [],
      sampleCapacity: capacityForecast[0]?.capacity || []
    });
    
    // Generate months
    const months: MonthInfo[] = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(startDate, i);
      months.push({
        key: format(monthDate, 'yyyy-MM'),
        label: format(monthDate, 'MMM yyyy')
      });
    }
    
    // Extract all unique skills from both forecasts
    const allSkills = new Set<SkillType>();
    
    demandForecast.forEach(period => {
      period.demand.forEach(skillHour => {
        allSkills.add(skillHour.skill);
      });
    });
    
    capacityForecast.forEach(period => {
      period.capacity.forEach(skillHour => {
        allSkills.add(skillHour.skill);
      });
    });
    
    const skills = Array.from(allSkills);
    debugLog('FIXED Skills extracted:', skills);
    
    // Generate data points with FIXED calculations
    const dataPoints: MatrixDataPoint[] = [];
    let totalDemand = 0;
    let totalCapacity = 0;
    
    months.forEach(month => {
      const demandPeriod = demandForecast.find(p => p.period === month.key);
      const capacityPeriod = capacityForecast.find(p => p.period === month.key);
      
      skills.forEach(skill => {
        // FIXED: Get demand hours for this skill (full hours allocation)
        const demandHours = demandPeriod?.demand.find(d => d.skill === skill)?.hours || 0;
        const capacityHours = capacityPeriod?.capacity.find(c => c.skill === skill)?.hours || 0;
        
        const gap = capacityHours - demandHours;
        const utilizationPercent = capacityHours > 0 ? (demandHours / capacityHours) * 100 : 0;
        
        dataPoints.push({
          skillType: skill,
          month: month.key,
          monthLabel: month.label,
          demandHours,
          capacityHours,
          gap,
          utilizationPercent
        });
        
        totalDemand += demandHours;
        totalCapacity += capacityHours;
      });
    });
    
    const matrixData: MatrixData = {
      months,
      skills,
      dataPoints,
      totalDemand,
      totalCapacity,
      totalGap: totalCapacity - totalDemand
    };
    
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
