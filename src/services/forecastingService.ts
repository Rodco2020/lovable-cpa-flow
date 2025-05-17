
import { ForecastData, ForecastHorizon, ForecastMode, SkillAllocationStrategy, ForecastParameters, ForecastResult, FinancialProjection } from '@/types/forecasting';
import { getActiveClients } from '@/services/clientService';
import { getTaskInstances } from '@/services/taskService';

// Default allocation strategy
let allocationStrategy: SkillAllocationStrategy = 'duplicate';

// Debug mode flag
let debugMode = false;

// Simple cache mechanism
let cache: {
  data: ForecastData | null;
  expiry: Date | null;
} = {
  data: null,
  expiry: null
};

/**
 * Calculate forecast data for a given horizon
 */
export const calculateForecast = async (
  horizon: ForecastHorizon,
  mode: ForecastMode = 'virtual',
  useCache: boolean = true
): Promise<ForecastData> => {
  // Basic implementation that returns a stub forecast
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);
  
  endDate.setDate(endDate.getDate() + 30); // Default 30-day forecast
  
  // Fetch necessary data
  const clients = await getActiveClients();
  const tasks = await getTaskInstances();
  
  // Create a stub forecast object
  const forecastData: ForecastData = {
    horizon,
    mode,
    period: horizon,
    timeframe: {
      startDate,
      endDate
    },
    demand: {
      totalHours: 100,
      taskCount: tasks.length,
      skillBreakdowns: {},
      timeBreakdown: [],
      forEach: (callback) => { /* Implementation */ }
    },
    capacity: {
      totalHours: 160,
      staffCount: 5,
      skillBreakdowns: {},
      timeBreakdown: [],
      forEach: (callback) => { /* Implementation */ }
    },
    gap: {
      totalGap: 60,
      hasSurplus: true,
      utilizationPercentage: 62.5,
      skillGaps: {}
    },
    financials: {
      monthlyRecurringRevenue: clients.reduce((sum, client) => sum + client.expectedMonthlyRevenue, 0),
      projectedRevenue: 15000,
      projectedCost: 10000,
      projectedProfit: 5000,
      profitMargin: 33.33,
      revenueAtRisk: 0,
      skillBreakdown: {},
      period: horizon,
      revenue: 15000,
      cost: 10000,
      profit: 5000
    },
    timestamp: now
  };
  
  // Cache the result
  cache = {
    data: forecastData,
    expiry: new Date(now.getTime() + 30 * 60000) // 30 minutes
  };
  
  return forecastData;
};

/**
 * Get the cached forecast data
 */
export const getCachedForecast = (): ForecastData | null => {
  const now = new Date();
  
  if (cache.data && cache.expiry && cache.expiry > now) {
    return cache.data;
  }
  
  return null;
};

/**
 * Clear the forecast cache
 */
export const clearForecastCache = (): void => {
  cache = {
    data: null,
    expiry: null
  };
};

/**
 * Set the skill allocation strategy
 */
export const setSkillAllocationStrategy = (strategy: SkillAllocationStrategy): void => {
  allocationStrategy = strategy;
  clearForecastCache(); // Clear cache when strategy changes
};

/**
 * Get the current skill allocation strategy
 */
export const getSkillAllocationStrategy = (): SkillAllocationStrategy => {
  return allocationStrategy;
};

/**
 * Toggle debug mode
 */
export const setForecastDebugMode = (enabled: boolean): void => {
  debugMode = enabled;
};

/**
 * Check if debug mode is enabled
 */
export const isForecastDebugModeEnabled = (): boolean => {
  return debugMode;
};

/**
 * Get forecast data with parameters (new format)
 */
export const getForecast = async (
  params: ForecastParameters
): Promise<ForecastResult> => {
  // For now, map to old function and transform result
  const horizon = params.timeframe === 'custom' ? 'month' : params.timeframe;
  const forecastData = await calculateForecast(horizon, params.mode);
  
  // Create dummy data for proper structure
  const timeSeriesData = [];
  const startDate = new Date();
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7);
    
    timeSeriesData.push({
      period: `Week ${i + 1}`,
      demand: [
        { skill: 'Tax', hours: Math.floor(Math.random() * 30) + 10 },
        { skill: 'Audit', hours: Math.floor(Math.random() * 20) + 5 }
      ],
      capacity: [
        { skill: 'Tax', hours: Math.floor(Math.random() * 40) + 20 },
        { skill: 'Audit', hours: Math.floor(Math.random() * 30) + 10 }
      ]
    });
  }
  
  // Create financial projections
  const financials = timeSeriesData.map((week) => {
    const revenue = Math.floor(Math.random() * 5000) + 8000;
    const cost = Math.floor(Math.random() * 3000) + 5000;
    return {
      period: week.period,
      revenue,
      cost,
      profit: revenue - cost
    };
  });
  
  // Return properly structured result
  return {
    data: timeSeriesData,
    financials,
    summary: {
      totalDemand: forecastData.demand.totalHours,
      totalCapacity: forecastData.capacity.totalHours,
      gap: forecastData.gap.totalGap,
      totalRevenue: forecastData.financials.projectedRevenue,
      totalCost: forecastData.financials.projectedCost,
      totalProfit: forecastData.financials.projectedProfit
    }
  };
};

/**
 * Validate the forecast system
 */
export const validateForecastSystem = async (): Promise<string[]> => {
  return []; // No issues by default
};

/**
 * Get task breakdown for forecasting
 */
export const getTaskBreakdown = async () => {
  const tasks = await getTaskInstances();
  
  return {
    totalTasks: tasks.length,
    breakdown: {
      byStatus: {},
      bySkill: {},
      byPriority: {}
    }
  };
};

/**
 * Estimate recurring task instances
 */
export const estimateRecurringTaskInstances = async () => {
  return {
    estimated: 0,
    breakdown: {}
  };
};
