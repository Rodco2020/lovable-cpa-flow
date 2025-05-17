
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, eachDayOfInterval, addWeeks } from 'date-fns';

import { RecurringTask, TaskInstance, TaskPriority, RecurrencePattern } from '@/types/task';
import { 
  ForecastData, 
  ForecastMode,
  ForecastParameters,
  ForecastResult,
  ForecastCapacity,
  ForecastDemand,
  ForecastGap,
  ForecastHorizon,
  FinancialProjection,
  SkillDemandData,
  SkillBreakdown,
  GapAnalysis,
  SkillAllocationStrategy
} from '@/types/forecasting';
import { StaffMember, StaffAvailability } from '@/types/staff';

// Mock utility functions for demo purposes
let debugMode = false;
let skillAllocationStrategy: SkillAllocationStrategy = 'duplicate';
const forecastCache = new Map<string, any>();

// Implement the functions needed
export const getForecast = async (params: ForecastParameters): Promise<ForecastResult> => {
  try {
    console.log('Generating forecast with parameters:', params);
    
    // Generate a cache key based on parameters
    const cacheKey = `${params.mode}-${params.timeframe}-${params.granularity}-${JSON.stringify(params.dateRange)}`;
    
    // Check if we have a cached result
    if (forecastCache.has(cacheKey) && !debugMode) {
      console.log('Returning cached forecast result');
      return forecastCache.get(cacheKey);
    }
    
    // Generate mock data based on parameters
    const startDate = params.dateRange?.startDate || new Date();
    const endDate = params.dateRange?.endDate || addDays(new Date(), 30);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = Math.ceil(days.length / 7);
    
    // Create weekly or monthly buckets based on granularity
    const buckets = params.granularity === 'weekly' ? 
      Array.from({ length: weeks }, (_, i) => {
        const bucketStart = addDays(startDate, i * 7);
        const bucketEnd = i === weeks - 1 ? endDate : addDays(bucketStart, 6);
        return { 
          period: `Week ${i + 1} (${format(bucketStart, 'MMM d')})`,
          startDate: bucketStart, 
          endDate: bucketEnd
        };
      }) : 
      Array.from({ length: Math.ceil(weeks / 4) }, (_, i) => {
        const bucketStart = addWeeks(startDate, i * 4);
        const bucketEnd = i === Math.ceil(weeks / 4) - 1 ? endDate : addDays(bucketStart, 27);
        return { 
          period: format(bucketStart, 'MMMM yyyy'),
          startDate: bucketStart, 
          endDate: bucketEnd
        };
      });
    
    // Generate data for each bucket
    const data = buckets.map((bucket, index) => {
      // Higher demand and lower capacity in earlier periods for demo
      const baseDemand = 100 - (index * 5);
      const baseCapacity = 90 + (index * 10);
      
      // Generate skill breakdown
      const skills = ['Tax', 'Audit', 'Advisory', 'Bookkeeping'];
      const skillDistribution = skills.map(skill => ({
        skillType: skill,
        hours: Math.floor(baseDemand / skills.length * (0.8 + Math.random() * 0.4))
      }));
      
      const skillCapacityDistribution = skills.map(skill => ({
        skillType: skill,
        hours: Math.floor(baseCapacity / skills.length * (0.8 + Math.random() * 0.4))
      }));
      
      return {
        period: bucket.period,
        startDate: bucket.startDate,
        endDate: bucket.endDate,
        demand: {
          totalHours: skillDistribution.reduce((sum, skill) => sum + skill.hours, 0),
          taskCount: Math.floor(skillDistribution.reduce((sum, skill) => sum + skill.hours, 0) / 2),
          skillBreakdowns: skillDistribution.reduce((acc, skill) => {
            acc[skill.skillType] = {
              skillType: skill.skillType,
              hours: skill.hours,
              taskCount: Math.floor(skill.hours / 2),
              percentage: 0, // Will be calculated
              tasks: []
            };
            return acc;
          }, {} as Record<string, SkillBreakdown>)
        },
        capacity: {
          totalHours: skillCapacityDistribution.reduce((sum, skill) => sum + skill.hours, 0),
          staffCount: Math.floor(skillCapacityDistribution.reduce((sum, skill) => sum + skill.hours, 0) / 40),
          skillBreakdowns: skillCapacityDistribution.reduce((acc, skill) => {
            acc[skill.skillType] = {
              skillType: skill.skillType,
              hours: skill.hours,
              taskCount: 0,
              percentage: 0, // Will be calculated
              tasks: []
            };
            return acc;
          }, {} as Record<string, SkillBreakdown>)
        }
      };
    });
    
    // Generate financials data
    const financials = buckets.map((bucket, index) => {
      const revenue = Math.round((data[index].demand.totalHours * 150) / 100) * 100; // $150 per hour, rounded to nearest hundred
      const cost = Math.round((data[index].capacity.totalHours * 60) / 100) * 100; // $60 per hour, rounded to nearest hundred
      const profit = revenue - cost;
      
      return {
        period: bucket.period,
        revenue,
        cost,
        profit,
        margin: ((profit / revenue) * 100).toFixed(1)
      };
    });
    
    // Calculate summary data
    const totalDemand = data.reduce((sum, item) => sum + item.demand.totalHours, 0);
    const totalCapacity = data.reduce((sum, item) => sum + item.capacity.totalHours, 0);
    const totalRevenue = financials.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = financials.reduce((sum, item) => sum + item.cost, 0);
    
    // Build the result
    const result: ForecastResult = {
      data,
      financials,
      summary: {
        totalDemand,
        totalCapacity,
        gap: totalCapacity - totalDemand,
        totalRevenue,
        totalCost,
        totalProfit: totalRevenue - totalCost
      }
    };
    
    // Cache the result
    forecastCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error generating forecast:', error);
    throw new Error('Failed to generate forecast data');
  }
};

export const clearForecastCache = (): void => {
  forecastCache.clear();
  console.log('Forecast cache cleared');
};

export const isForecastDebugModeEnabled = (): boolean => {
  return debugMode;
};

export const setForecastDebugMode = (enabled: boolean): void => {
  debugMode = enabled;
  console.log(`Forecast debug mode ${enabled ? 'enabled' : 'disabled'}`);
};

export const validateForecastSystem = async (): Promise<string[]> => {
  // This is a mock validation function that would check the integrity of the forecasting system
  const issues: string[] = [];
  
  // Simulate validations
  const randomFail = Math.random() > 0.7;
  if (randomFail) {
    issues.push('Some recurring tasks have invalid recurrence patterns');
    issues.push('Staff availability data is incomplete for 2 staff members');
  }
  
  return issues;
};

export const getTaskBreakdown = async (params: ForecastParameters): Promise<any[]> => {
  // Mock task breakdown data
  return Array.from({ length: 10 }, (_, i) => ({
    id: uuidv4(),
    name: `Task ${i + 1}`,
    client: `Client ${(i % 3) + 1}`,
    dueDate: addDays(new Date(), i * 2 + 3),
    estimatedHours: Math.floor(Math.random() * 10) + 2,
    priority: ['Low', 'Medium', 'High', 'Urgent'][Math.floor(Math.random() * 4)],
    status: ['Unscheduled', 'Scheduled', 'In Progress'][Math.floor(Math.random() * 3)]
  }));
};

export const getSkillAllocationStrategy = (): SkillAllocationStrategy => {
  return skillAllocationStrategy;
};

export const setSkillAllocationStrategy = (strategy: SkillAllocationStrategy): void => {
  skillAllocationStrategy = strategy;
  console.log(`Skill allocation strategy set to: ${strategy}`);
};

// Helper function to estimate recurring task instances in a date range
export const estimateRecurringTaskInstances = (
  task: RecurringTask, 
  startDate: Date, 
  endDate: Date
): { count: number; estimatedHours: number } => {
  let count = 0;
  let estimatedHours = 0;
  
  // Simple estimation logic based on recurrence type
  switch (task.recurrencePattern.type) {
    case 'Daily':
      count = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      if (task.recurrencePattern.interval && task.recurrencePattern.interval > 1) {
        count = Math.ceil(count / task.recurrencePattern.interval);
      }
      break;
      
    case 'Weekly':
      // Count weeks and multiply by number of weekdays specified (or 1 if none)
      const weeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekdayCount = task.recurrencePattern.weekdays?.length || 1;
      count = weeks * weekdayCount;
      if (task.recurrencePattern.interval && task.recurrencePattern.interval > 1) {
        count = Math.ceil(count / task.recurrencePattern.interval);
      }
      break;
      
    case 'Monthly':
      // Count months in the range
      const monthsStart = startDate.getMonth() + startDate.getFullYear() * 12;
      const monthsEnd = endDate.getMonth() + endDate.getFullYear() * 12;
      count = monthsEnd - monthsStart + 1;
      if (task.recurrencePattern.interval && task.recurrencePattern.interval > 1) {
        count = Math.ceil(count / task.recurrencePattern.interval);
      }
      break;
      
    case 'Quarterly':
      // Count quarters in the range
      const quartersStart = Math.floor(startDate.getMonth() / 3) + startDate.getFullYear() * 4;
      const quartersEnd = Math.floor(endDate.getMonth() / 3) + endDate.getFullYear() * 4;
      count = quartersEnd - quartersStart + 1;
      break;
      
    case 'Annually':
      // Count years in the range
      count = endDate.getFullYear() - startDate.getFullYear() + 1;
      break;
      
    case 'Custom':
      // For custom, use the custom offset days to estimate
      if (task.recurrencePattern.customOffsetDays && task.recurrencePattern.customOffsetDays > 0) {
        count = Math.ceil((endDate.getTime() - startDate.getTime()) / 
          (task.recurrencePattern.customOffsetDays * 24 * 60 * 60 * 1000));
      } else {
        count = 1; // Default to 1 if no custom offset specified
      }
      break;
      
    default:
      count = 1; // Default to 1 for unknown recurrence types
  }
  
  // If task has an end date that falls within our range, adjust count
  if (task.endDate && task.endDate < endDate) {
    const adjustedEndDate = task.endDate;
    
    // Recalculate based on adjusted end date
    switch (task.recurrencePattern.type) {
      case 'Daily':
        const daysAdjusted = Math.ceil((adjustedEndDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        count = Math.min(count, daysAdjusted);
        break;
      // ... similar adjustments for other recurrence types
    }
  }
  
  // Calculate total estimated hours
  estimatedHours = count * task.estimatedHours;
  
  return { count, estimatedHours };
};

// Mock implementations for schedulerService related functions
export const getMockForecastData = (): ForecastData => {
  return {
    mode: 'virtual',
    horizon: 'month',
    demand: {
      totalHours: 160,
      taskCount: 32,
      skillBreakdowns: {
        'Tax': {
          skillType: 'Tax',
          hours: 80,
          taskCount: 16,
          percentage: 50,
          tasks: []
        },
        'Audit': {
          skillType: 'Audit',
          hours: 40,
          taskCount: 8,
          percentage: 25,
          tasks: []
        },
        'Advisory': {
          skillType: 'Advisory',
          hours: 40,
          taskCount: 8,
          percentage: 25,
          tasks: []
        }
      },
      timeBreakdown: [] // Would contain time-series data
    },
    capacity: {
      totalHours: 200,
      staffCount: 5,
      skillBreakdowns: {
        'Tax': {
          skillType: 'Tax',
          hours: 100,
          taskCount: 0,
          percentage: 50,
          tasks: []
        },
        'Audit': {
          skillType: 'Audit',
          hours: 60,
          taskCount: 0,
          percentage: 30,
          tasks: []
        },
        'Advisory': {
          skillType: 'Advisory',
          hours: 40,
          taskCount: 0,
          percentage: 20,
          tasks: []
        }
      },
      timeBreakdown: [] // Would contain time-series data
    },
    timeframe: {
      startDate: new Date(),
      endDate: addDays(new Date(), 30)
    },
    timestamp: new Date()
  };
};
