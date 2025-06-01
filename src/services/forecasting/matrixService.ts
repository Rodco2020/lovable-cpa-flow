
import { 
  ForecastParameters, 
  ForecastResult
} from '@/types/forecasting';
import { MatrixData, transformForecastDataToMatrix, generate12MonthPeriods, fillMissingMatrixData } from './matrixUtils';
import { SkillsIntegrationService } from './skillsIntegrationService';
import { SkillAwareForecastingService } from './skillAwareForecastingService';
import { SkillType } from '@/types/task';
import { debugLog } from './logger';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Generate forecast data specifically optimized for 12-month matrix display
 * Enhanced with proper skill ID resolution and normalization
 */
export const generateMatrixForecast = async (
  forecastType: 'virtual' | 'actual' = 'virtual',
  startDate: Date = new Date()
): Promise<{ forecastResult: ForecastResult; matrixData: MatrixData }> => {
  debugLog('Generating 12-month matrix forecast with enhanced skill resolution', { forecastType, startDate });

  // Normalize start date to beginning of month
  const normalizedStartDate = startOfMonth(startDate);
  
  // Calculate end date (12 months from start)
  const endDate = endOfMonth(addMonths(normalizedStartDate, 11));

  try {
    // Generate demand and capacity forecasts using skill-aware service
    const [demandForecast, capacityForecast] = await Promise.all([
      SkillAwareForecastingService.generateDemandForecast(normalizedStartDate, endDate),
      SkillAwareForecastingService.generateCapacityForecast(normalizedStartDate, endDate)
    ]);

    // Merge demand and capacity data
    const mergedForecastData = demandForecast.map((demandPeriod, index) => {
      const capacityPeriod = capacityForecast[index];
      return {
        ...demandPeriod,
        capacity: capacityPeriod?.capacity || [],
        capacityHours: capacityPeriod?.capacityHours || 0
      };
    });

    debugLog(`Generated merged forecast with ${mergedForecastData.length} periods`);

    // Create forecast result
    const forecastResult: ForecastResult = {
      parameters: {
        mode: forecastType,
        timeframe: 'custom',
        dateRange: {
          startDate: normalizedStartDate,
          endDate: endDate
        },
        granularity: 'monthly',
        includeSkills: 'all'
      },
      data: mergedForecastData,
      financials: [],
      summary: {
        totalDemand: mergedForecastData.reduce((sum, period) => sum + (period.demandHours || 0), 0),
        totalCapacity: mergedForecastData.reduce((sum, period) => sum + (period.capacityHours || 0), 0),
        gap: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      },
      generatedAt: new Date()
    };

    // Transform forecast data to matrix format
    let matrixData = transformForecastDataToMatrix(forecastResult.data);

    // Ensure skills are properly normalized for matrix display
    const normalizedSkills = await Promise.all(
      matrixData.skills.map(skill => SkillsIntegrationService.normalizeSkill(skill))
    );
    
    // Remove duplicates and ensure consistent ordering
    const uniqueNormalizedSkills = Array.from(new Set(normalizedSkills)).sort();
    
    debugLog('Matrix skills normalization:', {
      originalSkills: matrixData.skills,
      normalizedSkills: uniqueNormalizedSkills
    });

    // Update matrix data with normalized skills
    matrixData = {
      ...matrixData,
      skills: uniqueNormalizedSkills,
      dataPoints: matrixData.dataPoints.map(point => ({
        ...point,
        skillType: SkillsIntegrationService.normalizeSkill(point.skillType)
      }))
    };

    // Generate expected months for validation
    const expectedMonths = generate12MonthPeriods(normalizedStartDate);
    
    // Get all available skills from integration service
    const availableSkills = await SkillsIntegrationService.getAvailableSkills();
    
    // Use the combination of available skills and matrix skills
    const allSkills = Array.from(new Set([...availableSkills, ...uniqueNormalizedSkills])).sort();

    // Fill any missing data to ensure complete matrix
    const completeMatrixData = fillMissingMatrixData(matrixData, allSkills, expectedMonths);

    debugLog('Matrix data transformation complete', {
      periodsCount: forecastResult.data.length,
      matrixMonths: completeMatrixData.months.length,
      matrixSkills: completeMatrixData.skills.length,
      availableSkills: availableSkills.length,
      dataPoints: completeMatrixData.dataPoints.length,
      skillBreakdown: completeMatrixData.skills.reduce((acc, skill) => {
        acc[skill] = completeMatrixData.dataPoints.filter(p => p.skillType === skill).length;
        return acc;
      }, {} as Record<string, number>)
    });

    return {
      forecastResult,
      matrixData: completeMatrixData
    };
  } catch (error) {
    console.error('Error generating matrix forecast:', error);
    throw new Error(`Matrix forecast generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Enhanced validation that checks for skills consistency
 */
export const validateMatrixData = (matrixData: MatrixData): string[] => {
  const issues: string[] = [];

  // Check for expected number of months (should be 12)
  if (matrixData.months.length !== 12) {
    issues.push(`Expected 12 months, got ${matrixData.months.length}`);
  }

  // Check for minimum expected skills
  if (matrixData.skills.length === 0) {
    issues.push('No skills found in matrix data');
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
    point => point.demandHours < 0 || point.capacityHours < 0
  );
  if (negativeValues.length > 0) {
    issues.push(`Found ${negativeValues.length} data points with negative values`);
  }

  // Check for unreasonable utilization values
  const unreasonableUtilization = matrixData.dataPoints.filter(
    point => point.utilizationPercent < 0 || point.utilizationPercent > 1000
  );
  if (unreasonableUtilization.length > 0) {
    issues.push(`Found ${unreasonableUtilization.length} data points with unreasonable utilization values`);
  }

  return issues;
};

/**
 * Cache key generator for matrix forecasts
 */
export const getMatrixCacheKey = (
  forecastType: 'virtual' | 'actual',
  startDate: Date
): string => {
  return `matrix_${forecastType}_${startDate.toISOString().slice(0, 7)}`;
};
