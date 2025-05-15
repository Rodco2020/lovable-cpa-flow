import { v4 as uuidv4 } from 'uuid';
import { 
  format, addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, 
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
  SkillAllocationStrategy
} from '@/types/forecasting';
import { SkillType, RecurringTask } from '@/types/task';
import { getRecurringTasks, getTaskInstances } from '@/services/taskService';
import { getAllStaff, getWeeklyAvailabilityByStaff } from '@/services/staffService';
import { getClientById } from '@/services/clientService';

// Define TaskBreakdownItem interface for hover details
interface TaskBreakdownItem {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  skill: SkillType;
  hours: number;
  dueDate?: string;
  status?: string;
}

// Cache for forecast results to avoid recalculating the same forecast
let forecastCache: Record<string, ForecastResult> = {};

// Debug mode is now controlled by the local storage setting
const getDebugMode = (): boolean => {
  return localStorage.getItem('forecast_debug_mode') === 'true';
};

// Debug logger function that checks debug mode before logging
const debugLog = (message: string, data?: any): void => {
  if (getDebugMode()) {
    if (data) {
      console.log(`[Forecast Debug] ${message}`, data);
    } else {
      console.log(`[Forecast Debug] ${message}`);
    }
  }
};

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
    
    // Fetch demand hours by skill for this period
    const demand = await calculateDemand(
      periodRange,
      parameters.mode,
      parameters.includeSkills,
      parameters.skillAllocationStrategy || 'duplicate' // Default to existing behavior
    );
    
    // Fetch capacity hours by skill for this period
    const capacity = await calculateCapacity(
      periodRange,
      parameters.mode,
      parameters.includeSkills
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
 * Calculate demand hours by skill for a specified period
 */
const calculateDemand = async (
  dateRange: DateRange,
  mode: ForecastMode,
  includeSkills: SkillType[] | "all",
  skillAllocationStrategy: SkillAllocationStrategy = 'duplicate'
): Promise<SkillHours[]> => {
  const skillHoursMap = {} as Record<SkillType, number>;
  
  debugLog(`Calculating ${mode} demand for date range: ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`);
  debugLog(`Using skill allocation strategy: ${skillAllocationStrategy}`);
  
  if (mode === 'virtual') {
    // Virtual demand is based on recurring tasks
    const recurringTasks = getRecurringTasks();
    
    debugLog(`Found ${recurringTasks.length} recurring tasks for virtual demand calculation`);
    
    // For each recurring task, calculate expected hours in the period
    recurringTasks.forEach(task => {
      // Skip tasks with skills not in the filter if specific skills are requested
      if (includeSkills !== "all" && 
          !task.requiredSkills.some(skill => includeSkills.includes(skill))) {
        debugLog(`Skipping task ${task.id}: required skills don't match filter`, {
          taskSkills: task.requiredSkills,
          filterSkills: includeSkills
        });
        return;
      }
      
      // Estimate how many instances would fall in the date range
      const instanceCount = estimateRecurringTaskInstances(task, dateRange);
      const totalTaskHours = task.estimatedHours * instanceCount;
      
      debugLog(`Task ${task.id} (${task.name}): ${instanceCount} instances × ${task.estimatedHours}h = ${totalTaskHours}h total`);
      
      if (task.requiredSkills.length === 0) {
        debugLog(`Warning: Task ${task.id} (${task.name}) has no required skills, skipping demand calculation`);
        return;
      }
      
      // Allocate hours to all required skills based on strategy
      if (skillAllocationStrategy === 'distribute' && task.requiredSkills.length > 0) {
        // Distribute hours evenly across all required skills
        const hoursPerSkill = totalTaskHours / task.requiredSkills.length;
        
        debugLog(`Distributing ${totalTaskHours}h across ${task.requiredSkills.length} skills (${hoursPerSkill}h per skill)`);
        
        task.requiredSkills.forEach(skill => {
          skillHoursMap[skill] = (skillHoursMap[skill] || 0) + hoursPerSkill;
          debugLog(`  - Allocated ${hoursPerSkill}h to skill ${skill}`);
        });
      } else {
        // Duplicate hours for each required skill (original behavior)
        task.requiredSkills.forEach(skill => {
          skillHoursMap[skill] = (skillHoursMap[skill] || 0) + totalTaskHours;
          debugLog(`  - Duplicated ${totalTaskHours}h to skill ${skill}`);
        });
      }
    });
  } else {
    // Actual demand is based on task instances that have been generated
    const taskInstances = getTaskInstances({
      dueAfter: dateRange.startDate,
      dueBefore: dateRange.endDate
    });
    
    debugLog(`Found ${taskInstances.length} task instances for actual demand calculation`);
    
    // For each task instance, add its hours to the demand using the selected strategy
    taskInstances.forEach(task => {
      // Skip tasks with skills not in the filter if specific skills are requested
      if (includeSkills !== "all" && 
          !task.requiredSkills.some(skill => includeSkills.includes(skill))) {
        return;
      }
      
      const totalTaskHours = task.estimatedHours;
      
      if (task.requiredSkills.length === 0) {
        debugLog(`Warning: Task instance ${task.id} has no required skills, skipping demand calculation`);
        return;
      }
      
      if (skillAllocationStrategy === 'distribute' && task.requiredSkills.length > 0) {
        // Distribute hours evenly across all required skills
        const hoursPerSkill = totalTaskHours / task.requiredSkills.length;
        
        task.requiredSkills.forEach(skill => {
          skillHoursMap[skill] = (skillHoursMap[skill] || 0) + hoursPerSkill;
        });
      } else {
        // Duplicate hours for each required skill (original behavior)
        task.requiredSkills.forEach(skill => {
          skillHoursMap[skill] = (skillHoursMap[skill] || 0) + totalTaskHours;
        });
      }
    });
  }
  
  // Convert map to array of SkillHours
  const result = Object.entries(skillHoursMap).map(([skill, hours]) => ({
    skill: skill as SkillType,
    hours
  }));
  
  debugLog(`Demand calculation complete, results:`, result);
  
  return result;
};

/**
 * Calculate capacity hours by skill for a specified period
 */
const calculateCapacity = async (
  dateRange: DateRange,
  mode: ForecastMode,
  includeSkills: SkillType[] | "all"
): Promise<SkillHours[]> => {
  // Get all staff members
  const allStaff = await getAllStaff();
  const skillHoursMap = {} as Record<SkillType, number>;
  
  // For each staff member
  for (const staff of allStaff) {
    // Skip staff with skills not in the filter if specific skills are requested
    if (includeSkills !== "all" && 
        !staff.skills.some(skillId => includeSkills.includes(skillId as SkillType))) {
      continue;
    }
    
    // Get weekly availability for this staff member
    const weeklyAvailability = await getWeeklyAvailabilityByStaff(staff.id);
    
    // Calculate total weekly available hours
    let totalWeeklyHours = 0;
    weeklyAvailability.forEach(slot => {
      if (slot.isAvailable) {
        const startParts = slot.startTime.split(':');
        const endParts = slot.endTime.split(':');
        
        const startHours = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
        const endHours = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;
        
        totalWeeklyHours += (endHours - startHours);
      }
    });
    
    // Calculate number of weeks in the period (simplified for now)
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const daysInPeriod = (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / millisecondsInDay;
    const weeksInPeriod = daysInPeriod / 7;
    
    // Calculate total hours for this staff member in the period
    const totalHours = totalWeeklyHours * weeksInPeriod;
    
    // Allocate hours to all skills of this staff member
    staff.skills.forEach(skillId => {
      const skill = skillId as SkillType;
      skillHoursMap[skill] = (skillHoursMap[skill] || 0) + totalHours;
    });
  }
  
  // Convert map to array of SkillHours
  return Object.entries(skillHoursMap).map(([skill, hours]) => ({
    skill: skill as SkillType,
    hours
  }));
};

/**
 * Generate financial projections based on forecast data
 */
const generateFinancialProjections = async (
  forecastData: ForecastData[],
  parameters: ForecastParameters
): Promise<FinancialProjection[]> => {
  const financials: FinancialProjection[] = [];
  
  // Get all staff for cost calculations
  const allStaff = await getAllStaff();
  
  // Calculate average cost per hour for each skill type
  const skillCostMap: Record<string, number> = {};
  allStaff.forEach(staff => {
    staff.skills.forEach(skillId => {
      if (!skillCostMap[skillId]) {
        skillCostMap[skillId] = staff.costPerHour;
      } else {
        // Take average if multiple staff have the same skill
        skillCostMap[skillId] = (skillCostMap[skillId] + staff.costPerHour) / 2;
      }
    });
  });
  
  // For each period in the forecast data
  for (const periodData of forecastData) {
    // Calculate cost based on demand hours * cost per hour
    let periodCost = 0;
    periodData.demand.forEach(skillHours => {
      periodCost += skillHours.hours * (skillCostMap[skillHours.skill] || 0);
    });
    
    // Calculate revenue (simplified for now - based on client monthly revenue)
    // In a real implementation, this would be more sophisticated
    let periodRevenue = 0;
    
    // Get tasks in this period
    const periodRange = getPeriodDateRange(periodData.period, parameters.granularity);
    const tasksInPeriod = getTaskInstances({
      dueAfter: periodRange.startDate,
      dueBefore: periodRange.endDate
    });
    
    // Track clients we've already counted
    const countedClients = new Set<string>();
    
    // For each task, add the client's expected monthly revenue if not already counted
    for (const task of tasksInPeriod) {
      if (!countedClients.has(task.clientId)) {
        // This is a mock - in a real app you'd fetch actual client data
        // const client = await getClientById(task.clientId);
        // if (client) {
        //   periodRevenue += client.expectedMonthlyRevenue;
        //   countedClients.add(task.clientId);
        // }
        
        // For now, let's simulate some revenue
        periodRevenue += 5000; // Dummy value
        countedClients.add(task.clientId);
      }
    }
    
    financials.push({
      period: periodData.period,
      revenue: periodRevenue,
      cost: periodCost,
      profit: periodRevenue - periodCost
    });
  }
  
  return financials;
};

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
      const extraMonths = differenceInMonths(endDate, addDays(startDate, yearsDiff * 365)) > 0 ? 1 : 0;
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
const getPeriodDateRange = (period: string, granularity: GranularityType): DateRange => {
  let startDate, endDate;
  
  switch (granularity) {
    case 'daily':
      startDate = new Date(period + 'T00:00:00');
      endDate = new Date(period + 'T23:59:59');
      break;
      
    case 'weekly':
      // Parse 'yyyy-'W'ww' format
      const [yearStrWeekly, weekStr] = period.split('-W');
      const yearWeekly = parseInt(yearStrWeekly);
      const week = parseInt(weekStr);
      
      // Calculate the first day of the week (Monday)
      startDate = new Date(yearWeekly, 0, 1);
      startDate.setDate(startDate.getDate() + (week - 1) * 7);
      while (startDate.getDay() !== 1) {
        startDate.setDate(startDate.getDate() - 1);
      }
      
      // End date is Sunday
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'monthly':
      // Parse 'yyyy-MM' format
      const [yearMonthly, month] = period.split('-').map(Number);
      startDate = new Date(yearMonthly, month - 1, 1);
      endDate = new Date(yearMonthly, month, 0, 23, 59, 59, 999);
      break;
      
    default:
      // Fallback to current day
      startDate = new Date();
      endDate = new Date();
      break;
  }
  
  return { startDate, endDate };
};

/**
 * Clear the forecast cache
 */
export const clearForecastCache = () => {
  debugLog('Clearing forecast cache');
  forecastCache = {};
};

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
};

/**
 * Get the current skill allocation strategy
 */
export const getSkillAllocationStrategy = (): SkillAllocationStrategy => {
  return (localStorage.getItem('forecast_skill_allocation_strategy') as SkillAllocationStrategy) || 'duplicate';
};

/**
 * Run validation checks on the forecasting system
 * Returns a list of any issues found, empty array if all checks pass
 */
export const validateForecastSystem = async (): Promise<string[]> => {
  const issues: string[] = [];
  
  debugLog('Running forecast system validation checks');
  
  // Check 1: Verify recurring tasks have valid recurrence patterns
  const recurringTasks = getRecurringTasks();
  recurringTasks.forEach(task => {
    if (!task.recurrencePattern || !task.recurrencePattern.type) {
      issues.push(`Task ${task.id} (${task.name}) has invalid recurrence pattern`);
    }
    if (!task.requiredSkills || task.requiredSkills.length === 0) {
      issues.push(`Task ${task.id} (${task.name}) has no required skills`);
    }
  });
  
  // Check 2: Verify staff have skills assigned
  const staff = await getAllStaff();
  staff.forEach(member => {
    if (!member.skills || member.skills.length === 0) {
      issues.push(`Staff member ${member.id} (${member.fullName}) has no assigned skills`);
    }
  });
  
  // Check 3: Verify that the forecast can be generated
  try {
    const testParams: ForecastParameters = {
      mode: 'virtual',
      timeframe: 'week',
      dateRange: {
        startDate: new Date(),
        endDate: addDays(new Date(), 7)
      },
      granularity: 'daily',
      includeSkills: 'all'
    };
    
    await generateForecast(testParams);
  } catch (error) {
    issues.push(`Failed to generate test forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  debugLog(`Validation complete. Found ${issues.length} issues:`, issues);
  
  return issues;
};

/**
 * Gets task breakdown data for the forecast period
 * Used to provide detailed hover information in the UI
 */
export const getTaskBreakdown = async (params: ForecastParameters): Promise<TaskBreakdownItem[]> => {
  try {
    // This is a mock implementation - in a real system, this would query
    // the database for actual task instances within the date range
    const mockTasks: TaskBreakdownItem[] = [
      {
        id: "task1",
        name: "Quarterly Tax Filing",
        clientName: "Acme Corp",
        clientId: "client1",
        skill: "tax-prep",
        hours: 8,
        dueDate: "2025-07-15",
        status: "scheduled"
      },
      {
        id: "task2",
        name: "Financial Statement Review",
        clientName: "Globex Industries",
        clientId: "client2",
        skill: "audit",
        hours: 12,
        dueDate: "2025-07-10",
        status: "scheduled"
      },
      {
        id: "task3",
        name: "Bookkeeping",
        clientName: "Sterling LLC",
        clientId: "client3",
        skill: "bookkeeping",
        hours: 6,
        dueDate: "2025-07-05",
        status: "scheduled"
      },
      {
        id: "task4",
        name: "Strategic Planning Session",
        clientName: "Tech Innovations",
        clientId: "client4",
        skill: "advisory",
        hours: 4,
        dueDate: "2025-07-20",
        status: "scheduled"
      }
    ];
    
    // In a real implementation, you would filter tasks based on the date range
    // and other parameters from the forecast parameters
    // This is just a placeholder for demonstration
    
    // Log for debug mode
    if (getDebugMode()) {
      console.log(`[Forecast Debug] Retrieved ${mockTasks.length} tasks for breakdown`);
    }
    
    return mockTasks;
  } catch (error) {
    console.error("Error getting task breakdown:", error);
    return [];
  }
};
