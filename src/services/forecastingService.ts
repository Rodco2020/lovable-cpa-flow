import { v4 as uuidv4 } from 'uuid';
import { 
  format, addDays, addMonths, addYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter,
  endOfQuarter, startOfYear, endOfYear, differenceInDays, differenceInWeeks,
  differenceInMonths, differenceInYears, isWithinInterval, getDay,
  isSameMonth, getDaysInMonth, isLeapYear
} from 'date-fns';

import { 
  ForecastParameters, 
  ForecastResult, 
  ForecastData, 
  DateRange,
  SkillHours,
  FinancialProjection,
  GranularityType,
  ForecastMode,
  ForecastTimeframe,
  SkillAllocationStrategy,
  ClientTaskBreakdown,
  TaskBreakdownItem
} from '@/types/forecasting';
import { SkillType, RecurringTask } from '@/types/task';
import { getRecurringTasks } from '@/services/taskService';
import { getAllStaff } from '@/services/staffService';

import { calculateDemand } from '@/services/forecasting/demand';
import { calculateCapacity } from '@/services/forecasting/capacity';
import { generateFinancialProjections } from '@/services/forecasting/financial';
import { debugLog, getDebugMode } from '@/services/forecasting/logger';
import { getPeriodDateRange } from '@/services/forecasting/utils';

// Cache for forecast results to avoid recalculating the same forecast
let forecastCache: Record<string, ForecastResult> = {};


/**
 * Clear the forecast cache
 */
export const clearForecastCache = () => {
  debugLog('Clearing forecast cache');
  forecastCache = {};
};

// Clear the forecast cache on startup to ensure fresh calculations
clearForecastCache();

/**
 * Generate a forecast based on the provided parameters
 */
export const generateForecast = async (parameters: ForecastParameters): Promise<ForecastResult> => {
  // Generate a cache key based on the parameters
  const cacheKey = JSON.stringify(parameters);
  
  debugLog(`Generating forecast with parameters:`, parameters);
  
  // Return cached result if available and not older than 5 minutes
  if (forecastCache[cacheKey]) {
    const cachedResult = forecastCache[cacheKey];
    const cacheAge = Date.now() - cachedResult.generatedAt.getTime();
    if (cacheAge < 5 * 60 * 1000) { // 5 minutes in milliseconds
      debugLog(`Using cached forecast result, age: ${cacheAge}ms`);
      return cachedResult;
    }
    debugLog(`Cache expired (age: ${cacheAge}ms), regenerating forecast`);
  } else {
    debugLog(`No cached result found, generating new forecast`);
  }
  
  // Validate parameters
  validateForecastParameters(parameters);
  
  // Set up the date range based on the timeframe
  const dateRange = parameters.timeframe === 'custom'
    ? parameters.dateRange
    : getDateRangeFromTimeframe(parameters.timeframe);

  debugLog(`Date range for forecast: ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`);

  // Calculate forecast periods based on granularity
  const periods = calculatePeriods(dateRange, parameters.granularity);
  debugLog(`Calculated ${periods.length} periods based on ${parameters.granularity} granularity`);
  
  // Generate the forecast data for each period
  const forecastData = await Promise.all(periods.map(async period => {
    debugLog(`Calculating forecast for period: ${period}`);

    const periodRange = getPeriodDateRange(period, parameters.granularity);
    debugLog(`Period date range: ${periodRange.startDate.toISOString()} to ${periodRange.endDate.toISOString()}`);

    // Clip the period range so it doesn't exceed the overall forecast range
    const clippedRange: DateRange = {
      startDate: new Date(Math.max(periodRange.startDate.getTime(), dateRange.startDate.getTime())),
      endDate: new Date(Math.min(periodRange.endDate.getTime(), dateRange.endDate.getTime()))
    };

    // Fetch demand hours by skill for this period
    const demand = await calculateDemand(
      clippedRange,
      parameters.mode,
      parameters.includeSkills,
      parameters.skillAllocationStrategy || getSkillAllocationStrategy()
    );
    
    // Fetch capacity hours by skill for this period
    // IMPORTANT: Always use 'distribute' strategy for capacity calculations for accurate numbers
    const capacity = await calculateCapacity(
      clippedRange,
      parameters.mode,
      parameters.includeSkills
      // No skillAllocationStrategy parameter - we'll hardcode 'distribute' in the function
    );
    
    debugLog(`Period ${period} calculation complete`, { demand, capacity });
    
    return {
      period,
      demand,
      capacity
    } as ForecastData;
  }));
  
  // Generate financial projections
  const financials = await generateFinancialProjections(forecastData, parameters);
  debugLog(`Financial projections generated`, financials);
  
  // Calculate summary metrics
  const summary = calculateSummary(forecastData, financials);
  debugLog(`Summary metrics calculated`, summary);
  
  // Create the complete forecast result
  const result: ForecastResult = {
    parameters,
    data: forecastData,
    financials,
    summary,
    generatedAt: new Date()
  };
  
  // Validate the forecast result before caching
  try {
    validateForecastResult(result);
    debugLog(`Forecast result validated successfully`);
  } catch (error) {
    console.error('[Forecast Validation Error]', error);
    throw new Error(`Forecast validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Cache the result
  forecastCache[cacheKey] = result;
  debugLog(`Forecast result cached with key: ${cacheKey.substring(0, 30)}...`);
  
  return result;
};

/**
 * Validate forecast parameters to ensure they are valid
 */
const validateForecastParameters = (parameters: ForecastParameters): void => {
  // Validate mode
  if (!['virtual', 'actual'].includes(parameters.mode)) {
    throw new Error(`Invalid forecast mode: ${parameters.mode}`);
  }
  
  // Validate timeframe
  if (!['week', 'month', 'quarter', 'year', 'custom'].includes(parameters.timeframe)) {
    throw new Error(`Invalid forecast timeframe: ${parameters.timeframe}`);
  }
  
  // Validate custom date range if timeframe is custom
  if (parameters.timeframe === 'custom') {
    if (!parameters.dateRange || !parameters.dateRange.startDate || !parameters.dateRange.endDate) {
      throw new Error('Custom timeframe requires valid dateRange with startDate and endDate');
    }
    
    if (parameters.dateRange.endDate < parameters.dateRange.startDate) {
      throw new Error('End date cannot be before start date');
    }
    
    // Check if date range is too large (e.g., more than 1 year)
    const daysDiff = differenceInDays(parameters.dateRange.endDate, parameters.dateRange.startDate);
    if (daysDiff > 366) {
      debugLog(`Warning: Large date range detected (${daysDiff} days), forecast may take longer to calculate`);
    }
  }
  
  // Validate granularity
  if (!['daily', 'weekly', 'monthly'].includes(parameters.granularity)) {
    throw new Error(`Invalid forecast granularity: ${parameters.granularity}`);
  }
  
  // Validate skill allocation strategy if provided
  if (parameters.skillAllocationStrategy && 
      !['duplicate', 'distribute'].includes(parameters.skillAllocationStrategy)) {
    throw new Error(`Invalid skill allocation strategy: ${parameters.skillAllocationStrategy}`);
  }
  
  debugLog('Forecast parameters validated successfully');
};

/**
 * Validate forecast result to ensure it contains expected data
 */
const validateForecastResult = (result: ForecastResult): void => {
  // Validate that data array exists and has at least one item
  if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
    throw new Error('Forecast result must contain data array with at least one item');
  }
  
  // Check if summary metrics are reasonable
  if (result.summary.totalCapacity < 0 || result.summary.totalDemand < 0) {
    throw new Error(`Negative values found in summary: capacity=${result.summary.totalCapacity}, demand=${result.summary.totalDemand}`);
  }
  
  // Check for unusually high values that might indicate calculation errors
  const MAX_REASONABLE_HOURS = 10000; // For example, 10,000 hours is extremely high for a forecast period
  if (result.summary.totalCapacity > MAX_REASONABLE_HOURS || 
      result.summary.totalDemand > MAX_REASONABLE_HOURS) {
    debugLog(`Warning: Unusually high values in forecast summary`, result.summary);
  }
  
  // Verify that each period has both demand and capacity data
  result.data.forEach((periodData, index) => {
    if (!periodData.period) {
      throw new Error(`Period identifier missing in data[${index}]`);
    }
    
    if (!Array.isArray(periodData.demand)) {
      throw new Error(`Demand data missing or invalid in period ${periodData.period}`);
    }
    
    if (!Array.isArray(periodData.capacity)) {
      throw new Error(`Capacity data missing or invalid in period ${periodData.period}`);
    }
  });
};

/**

/**
 * Calculate summary metrics for the forecast
 */
const calculateSummary = (
  forecastData: ForecastData[],
  financials: FinancialProjection[]
) => {
  // Initialize summary values
  let totalDemand = 0;
  let totalCapacity = 0;
  let totalRevenue = 0;
  let totalCost = 0;
  
  // Sum up demand and capacity hours
  forecastData.forEach(periodData => {
    periodData.demand.forEach(skillHours => {
      totalDemand += skillHours.hours;
    });
    periodData.capacity.forEach(skillHours => {
      totalCapacity += skillHours.hours;
    });
  });
  
  // Sum up financial projections
  financials.forEach(financial => {
    totalRevenue += financial.revenue;
    totalCost += financial.cost;
  });
  
  return {
    totalDemand,
    totalCapacity,
    gap: totalCapacity - totalDemand,
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost
  };
};

/**
 * Helper function to estimate how many instances of a recurring task would occur in a date range
 * Enhanced with more accurate date calculations and validation
 */
export const estimateRecurringTaskInstances = (task: RecurringTask, dateRange: DateRange): number => {
  const pattern = task.recurrencePattern;
  let instanceCount = 0;
  
  // Validate inputs
  if (!pattern || !pattern.type) {
    debugLog(`Invalid recurrence pattern for task: ${task.name}`);
    return 0;
  }
  
  // Get start and end dates for calculation
  const startDate = new Date(Math.max(
    dateRange.startDate.getTime(),
    task.createdAt.getTime()
  ));
  
  const endDate = pattern.endDate && pattern.endDate < dateRange.endDate 
    ? pattern.endDate 
    : dateRange.endDate;
  
  // If end date is before start date, no instances will occur
  if (endDate < startDate) {
    debugLog(`No instances for task ${task.id} (${task.name}): end date (${endDate.toISOString()}) is before start date (${startDate.toISOString()})`);
    return 0;
  }
  
  debugLog(`Calculating instances for task ${task.id} (${task.name}):`, {
    patternType: pattern.type, 
    interval: pattern.interval || 1,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  
  switch (pattern.type) {
    case 'Daily':
      // Accurate count of days in the range considering the interval
      const daysDiff = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end days
      instanceCount = Math.ceil(daysDiff / (pattern.interval || 1));
      break;
      
    case 'Weekly':
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        // Count specific weekdays within the period
        instanceCount = 0;
        
        // Calculate full weeks in the range
        const fullWeeks = Math.floor(differenceInDays(endDate, startDate) / 7);
        const remainingDays = differenceInDays(endDate, addDays(startDate, fullWeeks * 7));
        
        // Count instances for full weeks
        instanceCount += fullWeeks * pattern.weekdays.length / (pattern.interval || 1);
        
        // Count instances for remaining days
        let currentDay = addDays(startDate, fullWeeks * 7);
        for (let i = 0; i <= remainingDays; i++) {
          const dayOfWeek = getDay(currentDay); // 0 = Sunday, 1 = Monday, etc.
          if (pattern.weekdays.includes(dayOfWeek)) {
            instanceCount++;
          }
          currentDay = addDays(currentDay, 1);
        }
        
        // Apply interval
        instanceCount = instanceCount / (pattern.interval || 1);
      } else {
        // Simple weekly recurrence (every X weeks)
        instanceCount = (differenceInDays(endDate, startDate) + 1) / 7 / (pattern.interval || 1);
      }
      break;
      
    case 'Monthly':
      // Calculate months between start and end, considering day of month
      const monthsDiff = differenceInMonths(endDate, startDate);
      
      if (pattern.dayOfMonth) {
        // If specific day of month is specified
        instanceCount = 0;
        
        // For each month in the range
        for (let i = 0; i <= monthsDiff; i++) {
          const currentMonth = addDays(startDate, i * 30); // Approximation
          const daysInCurrentMonth = getDaysInMonth(currentMonth);
          
          // Check if the day exists in this month and falls within our range
          if (pattern.dayOfMonth <= daysInCurrentMonth) {
            const instanceDate = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              pattern.dayOfMonth
            );
            
            if (instanceDate >= startDate && instanceDate <= endDate) {
              instanceCount++;
            }
          }
        }
      } else {
        // Simple monthly recurrence (same day each month)
        instanceCount = monthsDiff + 1; // +1 to include both start and end months
      }
      
      // Apply interval
      instanceCount = instanceCount / (pattern.interval || 1);
      break;
      
    case 'Quarterly':
      // Each quarter is 3 months
      instanceCount = Math.ceil(differenceInMonths(endDate, startDate) / 3 / (pattern.interval || 1));
      break;
      
    case 'Annually':
      // Count years, handling partial years
      const yearsDiff = differenceInYears(endDate, startDate);
      const extraMonths = differenceInMonths(endDate, addYears(startDate, yearsDiff)) > 0 ? 1 : 0;
      instanceCount = (yearsDiff + extraMonths) / (pattern.interval || 1);
      break;
      
    case 'Custom':
      // For custom patterns, estimate based on custom offset days
      if (pattern.customOffsetDays && pattern.customOffsetDays > 0) {
        instanceCount = Math.ceil(differenceInDays(endDate, startDate) / pattern.customOffsetDays);
      } else {
        instanceCount = 1; // Default to one instance if no custom logic applies
      }
      break;
      
    default:
      // For unknown patterns, use a default estimate of one instance
      debugLog(`Warning: Unknown recurrence pattern type "${pattern.type}" for task ${task.id} (${task.name})`);
      instanceCount = 1;
      break;
  }
  
  // Ensure we always return a non-negative integer
  instanceCount = Math.max(0, Math.round(instanceCount));
  
  debugLog(`Final instance count for task ${task.id} (${task.name}): ${instanceCount}`);
  
  return instanceCount;
};

/**
 * Helper function to convert a timeframe to a date range
 */
const getDateRangeFromTimeframe = (timeframe: ForecastTimeframe): DateRange => {
  const today = new Date();
  
  switch (timeframe) {
    case 'week':
      return {
        startDate: startOfWeek(today, { weekStartsOn: 1 }),
        endDate: endOfWeek(today, { weekStartsOn: 1 })
      };
      
    case 'month':
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today)
      };
      
    case 'quarter':
      return {
        startDate: startOfQuarter(today),
        endDate: endOfQuarter(today)
      };
      
    case 'year':
      return {
        startDate: startOfYear(today),
        endDate: endOfYear(today)
      };
      
    default:
      // Default to next 30 days for unknown timeframes
      return {
        startDate: today,
        endDate: addDays(today, 30)
      };
  }
};

/**
 * Helper function to calculate period strings based on granularity
 */
const calculatePeriods = (dateRange: DateRange, granularity: GranularityType): string[] => {
  const periods: string[] = [];
  
  switch (granularity) {
    case 'daily':
      eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate
      }).forEach(date => {
        periods.push(format(date, 'yyyy-MM-dd'));
      });
      break;
      
    case 'weekly':
      eachWeekOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate
      }, { weekStartsOn: 1 }).forEach(date => {
        periods.push(format(date, 'yyyy-\'W\'ww'));
      });
      break;
      
    case 'monthly':
      eachMonthOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate
      }).forEach(date => {
        periods.push(format(date, 'yyyy-MM'));
      });
      break;
  }
  
  return periods;
};

/**
 * Helper function to convert a period string to a date range
 */

/**
 * Get a forecast from the cache or generate a new one if not cached
 */
export const getForecast = async (parameters: ForecastParameters): Promise<ForecastResult> => {
  try {
    debugLog('Attempting to get forecast', parameters);
    return await generateForecast(parameters);
  } catch (error) {
    console.error('Error generating forecast:', error);
    throw error;
  }
};

/**
 * Enable or disable debug mode for forecast calculations
 */
export const setForecastDebugMode = (enabled: boolean): void => {
  localStorage.setItem('forecast_debug_mode', enabled ? 'true' : 'false');
  debugLog(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
};

/**
 * Check if forecast debug mode is enabled
 */
export const isForecastDebugModeEnabled = (): boolean => {
  return localStorage.getItem('forecast_debug_mode') === 'true';
};

/**
 * Set the skill allocation strategy for forecast calculations
 */
export const setSkillAllocationStrategy = (strategy: SkillAllocationStrategy): void => {
  localStorage.setItem('forecast_skill_allocation_strategy', strategy);
  debugLog(`Skill allocation strategy set to: ${strategy}`);
  // Clear the cache when the strategy changes to force recalculation
  clearForecastCache();
};

/**
 * Get the current skill allocation strategy
 */
export const getSkillAllocationStrategy = (): SkillAllocationStrategy => {
  return (localStorage.getItem('forecast_skill_allocation_strategy') as SkillAllocationStrategy) || 'distribute';
};

/**
 * Run validation checks on the forecasting system
 * Returns a list of any issues found, empty array if all checks pass
 */
export const validateForecastSystem = async (): Promise<string[]> => {
    console.error(`Error calculating task data for client ${clientId}:`, error);
    return {
      totalMonthlyHours: 0,
      categoryBreakdown: {},
    };
  }
};

/**
 * Calculate total demand for a skill within a date range
 */
export const calculateTotalDemandForSkill = async (
  skillId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> => {
  try {
    let totalDemand = 0;
    const recurringTasks = await getRecurringTasks(true);
    
    for (const task of recurringTasks) {
      if (task.requiredSkills.includes(skillId as any)) {
        // Calculate demand for this task within the date range
        const demand = await calculateDemandForTask(task, startDate, endDate);
        totalDemand += demand;
      }
    }
    
    return totalDemand;
  } catch (error) {
    console.error(`Error calculating demand for skill ${skillId}:`, error);
    return 0;
  }
};

/**
 * Calculate demand for a specific task within a date range
 */
const calculateDemandForTask = async (
  task: RecurringTask,
  startDate?: Date,
  endDate?: Date
): Promise<number> => {
  const pattern = task.recurrencePattern;
  
  if (!pattern || !pattern.type) {
    debugLog(`Invalid recurrence pattern for task: ${task.name}`);
    return 0;
  }
  
  const startDateForCalc = startDate || task.createdAt;
  const endDateForCalc = endDate || task.recurrencePattern.endDate;
  
  let instanceCount = 0;
  
  switch (pattern.type) {
    case 'Daily':
      // Accurate count of days in the range considering the interval
      const daysDiff = differenceInDays(endDateForCalc, startDateForCalc) + 1; // +1 to include both start and end days
      instanceCount = Math.ceil(daysDiff / (pattern.interval || 1));
      break;
      
    case 'Weekly':
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        // Count specific weekdays within the period
        instanceCount = 0;
        
        // Calculate full weeks in the range
        const fullWeeks = Math.floor(differenceInDays(endDateForCalc, startDateForCalc) / 7);
        const remainingDays = differenceInDays(endDateForCalc, addDays(startDateForCalc, fullWeeks * 7));
        
        // Count instances for full weeks
        instanceCount += fullWeeks * pattern.weekdays.length / (pattern.interval || 1);
        
        // Count instances for remaining days
        let currentDay = addDays(startDateForCalc, fullWeeks * 7);
        for (let i = 0; i <= remainingDays; i++) {
          const dayOfWeek = getDay(currentDay); // 0 = Sunday, 1 = Monday, etc.
          if (pattern.weekdays.includes(dayOfWeek)) {
            instanceCount++;
          }
          currentDay = addDays(currentDay, 1);
        }
        
        // Apply interval
        instanceCount = instanceCount / (pattern.interval || 1);
      } else {
        // Simple weekly recurrence (every X weeks)
        instanceCount = (differenceInDays(endDateForCalc, startDateForCalc) + 1) / 7 / (pattern.interval || 1);
      }
      break;
      
    case 'Monthly':
      // Calculate months between start and end, considering day of month
      const monthsDiff = differenceInMonths(endDateForCalc, startDateForCalc);
      
      if (pattern.dayOfMonth) {
        // If specific day of month is specified
        instanceCount = 0;
        
        // For each month in the range
        for (let i = 0; i <= monthsDiff; i++) {
          const currentMonth = addMonths(startDateForCalc, i);
          const daysInCurrentMonth = getDaysInMonth(currentMonth);
          
          // Check if the day exists in this month and falls within our range
          if (pattern.dayOfMonth <= daysInCurrentMonth) {
            const instanceDate = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              pattern.dayOfMonth
            );
            
            if (instanceDate >= startDateForCalc && instanceDate <= endDateForCalc) {
              instanceCount++;
            }
          }
        }
      } else {
        // Simple monthly recurrence (same day each month)
        instanceCount = monthsDiff + 1; // +1 to include both start and end months
      }
      
      // Apply interval
      instanceCount = instanceCount / (pattern.interval || 1);
      break;
      
    case 'Quarterly':
      // Each quarter is 3 months
      instanceCount = Math.ceil(differenceInMonths(endDateForCalc, startDateForCalc) / 3 / (pattern.interval || 1));
      break;
      
    case 'Annually':
      // Count years, handling partial years
      const yearsDiff = differenceInYears(endDateForCalc, startDateForCalc);
      const extraMonths = differenceInMonths(endDateForCalc, addYears(startDateForCalc, yearsDiff)) > 0 ? 1 : 0;
      instanceCount = (yearsDiff + extraMonths) / (pattern.interval || 1);
      break;
      
    case 'Custom':
      // For custom patterns, estimate based on custom offset days
      if (pattern.customOffsetDays && pattern.customOffsetDays > 0) {
        instanceCount = Math.ceil(differenceInDays(endDateForCalc, startDateForCalc) / pattern.customOffsetDays);
      } else {
        instanceCount = 1; // Default to one instance if no custom logic applies
      }
      break;
      
    default:
      // For unknown patterns, use a default estimate of one instance
      debugLog(`Warning: Unknown recurrence pattern type "${pattern.type}" for task ${task.id} (${task.name})`);
      instanceCount = 1;
      break;
  }
  
  // Ensure we always return a non-negative integer
  instanceCount = Math.max(0, Math.round(instanceCount));
  
  debugLog(`Final instance count for task ${task.id} (${task.name}): ${instanceCount}`);
  
  return instanceCount;
};

/**
 * Estimate monthly hours for a recurring task
 */
const estimateMonthlyHoursForTask = (task: RecurringTask): number => {
  const pattern = task.recurrencePattern;
  
  if (!pattern || !pattern.type) {
    debugLog(`Invalid recurrence pattern for task: ${task.name}`);
    return 0;
  }
  
  let monthlyHours = 0;
  
  switch (pattern.type) {
    case 'Daily':
      // Estimate hours per day and multiply by 30 (approximation)
      monthlyHours = task.estimatedHours * 30;
      break;
      
    case 'Weekly':
      // Estimate hours per week and multiply by 4 (approximation)
      monthlyHours = task.estimatedHours * 4;
      break;
      
    case 'Monthly':
      // Use the estimated hours directly
      monthlyHours = task.estimatedHours;
      break;
      
    case 'Quarterly':
      // Estimate hours per quarter and multiply by 3 (approximation)
      monthlyHours = task.estimatedHours * 3;
      break;
      
    case 'Annually':
      // Estimate hours per year and multiply by 1 (approximation)
      monthlyHours = task.estimatedHours;
      break;
      
    case 'Custom':
      // For custom patterns, estimate based on custom offset days
      if (pattern.customOffsetDays && pattern.customOffsetDays > 0) {
        monthlyHours = task.estimatedHours * (pattern.customOffsetDays / 30);
      } else {
        monthlyHours = task.estimatedHours; // Default to full estimated hours
      }
      break;
      
    default:
      // For unknown patterns, use a default estimate of one instance
      debugLog(`Warning: Unknown recurrence pattern type "${pattern.type}" for task ${task.id} (${task.name})`);
      monthlyHours = task.estimatedHours;
      break;
  }
  
  return monthlyHours;
};
