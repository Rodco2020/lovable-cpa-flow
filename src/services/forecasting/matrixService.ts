
import { 
  ForecastParameters, 
  ForecastResult,
  ForecastData
} from '@/types/forecasting';
import { generateForecast } from '@/services/forecastingService';
import { MatrixData, transformForecastDataToMatrix, generate12MonthPeriods, fillMissingMatrixData } from './matrixUtils';
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
    const matrixData = transformForecastDataToMatrix(forecastResult.data);
    
    // Generate expected months for validation
    const expectedMonths = generate12MonthPeriods(normalizedStartDate);
    
    // Define expected skills (these should match your system's skill types)
    const expectedSkills = [
      'Junior',
      'Senior', 
      'CPA',
      'Tax Specialist',
      'Audit',
      'Advisory',
      'Bookkeeping'
    ] as any[];

    // Fill any missing data to ensure complete matrix
    const completeMatrixData = fillMissingMatrixData(matrixData, expectedSkills, expectedMonths);

    debugLog('Matrix data transformation complete', {
      periodsCount: forecastResult.data.length,
      matrixMonths: completeMatrixData.months.length,
      matrixSkills: completeMatrixData.skills.length,
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
 * Validate that the matrix data is complete and correct
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
    issues.push(`Expected ${expectedDataPoints} data points, got ${matrixData.dataPoints.length}`);
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
