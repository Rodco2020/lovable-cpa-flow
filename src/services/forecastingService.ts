
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

import { 
  ForecastParameters, 
  ForecastResult, 
  ForecastData, 
  DateRange,
  SkillHours,
  FinancialProjection,
  GranularityType,
  ForecastMode,
  ForecastTimeframe
} from '@/types/forecasting';
import { SkillType, RecurringTask } from '@/types/task';
import { getRecurringTasks, getTaskInstances } from '@/services/taskService';
import { getAllStaff, getWeeklyAvailabilityByStaff } from '@/services/staffService';
import { getClientById } from '@/services/clientService';

// Cache for forecast results to avoid recalculating the same forecast
let forecastCache: Record<string, ForecastResult> = {};

/**
 * Generate a forecast based on the provided parameters
 */
export const generateForecast = async (parameters: ForecastParameters): Promise<ForecastResult> => {
  // Generate a cache key based on the parameters
  const cacheKey = JSON.stringify(parameters);
  
  // Return cached result if available and not older than 5 minutes
  if (forecastCache[cacheKey]) {
    const cachedResult = forecastCache[cacheKey];
    const cacheAge = Date.now() - cachedResult.generatedAt.getTime();
    if (cacheAge < 5 * 60 * 1000) { // 5 minutes in milliseconds
      return cachedResult;
    }
  }
  
  // Set up the date range based on the timeframe
  const dateRange = parameters.timeframe === 'custom'
    ? parameters.dateRange
    : getDateRangeFromTimeframe(parameters.timeframe);

  // Calculate forecast periods based on granularity
  const periods = calculatePeriods(dateRange, parameters.granularity);
  
  // Generate the forecast data for each period
  const forecastData = await Promise.all(periods.map(async period => {
    const periodRange = getPeriodDateRange(period, parameters.granularity);
    
    // Fetch demand hours by skill for this period
    const demand = await calculateDemand(
      periodRange,
      parameters.mode,
      parameters.includeSkills
    );
    
    // Fetch capacity hours by skill for this period
    const capacity = await calculateCapacity(
      periodRange,
      parameters.mode,
      parameters.includeSkills
    );
    
    return {
      period,
      demand,
      capacity
    } as ForecastData;
  }));
  
  // Generate financial projections
  const financials = await generateFinancialProjections(forecastData, parameters);
  
  // Calculate summary metrics
  const summary = calculateSummary(forecastData, financials);
  
  // Create the complete forecast result
  const result: ForecastResult = {
    parameters,
    data: forecastData,
    financials,
    summary,
    generatedAt: new Date()
  };
  
  // Cache the result
  forecastCache[cacheKey] = result;
  
  return result;
};

/**
 * Calculate demand hours by skill for a specified period
 */
const calculateDemand = async (
  dateRange: DateRange,
  mode: ForecastMode,
  includeSkills: SkillType[] | "all"
): Promise<SkillHours[]> => {
  const skillHoursMap: Record<SkillType, number> = {};
  
  if (mode === 'virtual') {
    // Virtual demand is based on recurring tasks
    const recurringTasks = getRecurringTasks();
    
    // For each recurring task, calculate expected hours in the period
    recurringTasks.forEach(task => {
      // Skip tasks with skills not in the filter if specific skills are requested
      if (includeSkills !== "all" && 
          !task.requiredSkills.some(skill => includeSkills.includes(skill))) {
        return;
      }
      
      // Estimate how many instances would fall in the date range
      const instanceCount = estimateRecurringTaskInstances(task, dateRange);
      
      // Allocate hours to all required skills
      task.requiredSkills.forEach(skill => {
        skillHoursMap[skill] = (skillHoursMap[skill] || 0) + 
                                (task.estimatedHours * instanceCount);
      });
    });
  } else {
    // Actual demand is based on task instances that have been generated
    const taskInstances = getTaskInstances({
      dueAfter: dateRange.startDate,
      dueBefore: dateRange.endDate
    });
    
    // For each task instance, add its hours to the demand
    taskInstances.forEach(task => {
      // Skip tasks with skills not in the filter if specific skills are requested
      if (includeSkills !== "all" && 
          !task.requiredSkills.some(skill => includeSkills.includes(skill))) {
        return;
      }
      
      task.requiredSkills.forEach(skill => {
        skillHoursMap[skill] = (skillHoursMap[skill] || 0) + task.estimatedHours;
      });
    });
  }
  
  // Convert map to array of SkillHours
  return Object.entries(skillHoursMap).map(([skill, hours]) => ({
    skill: skill as SkillType,
    hours
  }));
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
  const skillHoursMap: Record<SkillType, number> = {};
  
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
 */
const estimateRecurringTaskInstances = (task: RecurringTask, dateRange: DateRange): number => {
  const pattern = task.recurrencePattern;
  let instanceCount = 0;
  
  switch (pattern.type) {
    case 'Daily':
      // Number of days in the range
      instanceCount = Math.floor((dateRange.endDate.getTime() - dateRange.startDate.getTime()) 
                       / (1000 * 60 * 60 * 24)) / (pattern.interval || 1);
      break;
      
    case 'Weekly':
      // Number of weeks in the range
      instanceCount = Math.floor((dateRange.endDate.getTime() - dateRange.startDate.getTime()) 
                       / (1000 * 60 * 60 * 24 * 7)) / (pattern.interval || 1);
      
      // If specific weekdays are defined, adjust the count
      if (pattern.weekdays) {
        instanceCount *= pattern.weekdays.length / 7;
      }
      break;
      
    case 'Monthly':
      // Number of months (approximate)
      instanceCount = (dateRange.endDate.getFullYear() * 12 + dateRange.endDate.getMonth()) - 
                      (dateRange.startDate.getFullYear() * 12 + dateRange.startDate.getMonth())
                      / (pattern.interval || 1);
      break;
      
    case 'Quarterly':
      // Number of quarters (approximate)
      instanceCount = Math.floor(((dateRange.endDate.getFullYear() * 12 + dateRange.endDate.getMonth()) - 
                      (dateRange.startDate.getFullYear() * 12 + dateRange.startDate.getMonth())) / 3)
                      / (pattern.interval || 1);
      break;
      
    case 'Annually':
      // Number of years
      instanceCount = (dateRange.endDate.getFullYear() - dateRange.startDate.getFullYear())
                      / (pattern.interval || 1);
      break;
      
    default:
      // For custom patterns, use a default estimate
      instanceCount = 1;
      break;
  }
  
  return Math.max(0, Math.round(instanceCount));
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
      const [yearStr, weekStr] = period.split('-W');
      const year = parseInt(yearStr);
      const week = parseInt(weekStr);
      
      // Calculate the first day of the week (Monday)
      startDate = new Date(year, 0, 1);
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
      const [year, month] = period.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
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
  forecastCache = {};
};

/**
 * Get a forecast from the cache or generate a new one if not cached
 */
export const getForecast = async (parameters: ForecastParameters): Promise<ForecastResult> => {
  return generateForecast(parameters);
};
