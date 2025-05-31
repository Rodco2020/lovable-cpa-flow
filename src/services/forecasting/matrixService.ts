
import { 
  ForecastParameters, 
  ForecastResult,
  ForecastData
} from '@/types/forecasting';
import { generateForecast } from '@/services/forecastingService';
import { MatrixData, transformForecastDataToMatrix, generate12MonthPeriods, fillMissingMatrixData } from './matrixUtils';
import { SkillsIntegrationService } from './skillsIntegrationService';
import { debugLog } from './logger';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Generate forecast data specifically optimized for 12-month matrix display
 */
export const generateMatrixForecast = async (
  forecastType: 'virtual' | 'actual' = 'virtual',
  startDate: Date = new Date()
): Promise<{ forecastResult: ForecastResult; matrixData: MatrixData }> => {
  debugLog('Generating 12-month matrix forecast', { forecastType, startDate });

  // Normalize start date to beginning of month
  const normalizedStartDate = startOfMonth(startDate);
  
  // Calculate end date (12 months from start)
  const endDate = endOfMonth(addMonths(normalizedStartDate, 11));

  // Create forecast parameters for 12-month period with monthly granularity
  const parameters: ForecastParameters = {
    mode: forecastType,
    timeframe: 'custom',
    dateRange: {
      startDate: normalizedStartDate,
      endDate: endDate
    },
    granularity: 'monthly',
    includeSkills: 'all',
    skillAllocationStrategy: 'distribute'
  };

  debugLog('Matrix forecast parameters', parameters);

  try {
    // Generate the forecast using existing service
    const forecastResult = await generateForecast(parameters);
    
    debugLog(`Generated forecast with ${forecastResult.data.length} periods`);

    // Transform forecast data to matrix format
    let matrixData = transformForecastDataToMatrix(forecastResult.data);
    
    // Generate expected months for validation
    const expectedMonths = generate12MonthPeriods(normalizedStartDate);
    
    // Get normalized skills from the skills integration service
    const availableSkills = await SkillsIntegrationService.getAvailableSkills();
    const normalizedMatrixSkills = await SkillsIntegrationService.normalizeMatrixSkills(matrixData.skills);
    
    // Use the larger set of skills (available skills or normalized matrix skills)
    const expectedSkills = normalizedMatrixSkills.length > availableSkills.length 
      ? normalizedMatrixSkills 
      : availableSkills;

    // Update matrix data with normalized skills
    matrixData = {
      ...matrixData,
      skills: expectedSkills
    };

    // Fill any missing data to ensure complete matrix
    const completeMatrixData = fillMissingMatrixData(matrixData, expectedSkills, expectedMonths);

    debugLog('Matrix data transformation complete', {
      periodsCount: forecastResult.data.length,
      matrixMonths: completeMatrixData.months.length,
      matrixSkills: completeMatrixData.skills.length,
      normalizedSkills: expectedSkills.length,
      dataPoints: completeMatrixData.dataPoints.length
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
