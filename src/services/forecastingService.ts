
import { 
  RecurringTask, 
  TaskInstance, 
  SkillType 
} from '@/types/task';

import { 
  StaffAvailability, 
  StaffMember, 
  TimeSlot 
} from '@/types/staff';

import {
  ForecastData,
  ForecastCapacity,
  ForecastDemand,
  ForecastGap,
  ForecastHorizon,
  ForecastMode,
  FinancialProjection,
  SkillDemandData,
  SkillBreakdown,
  GapAnalysis
} from '@/types/forecasting';

import { Client } from '@/types/client';

import { getActiveClients } from '@/services/clientService';
import { getAllStaffMembers, getStaffAvailability } from '@/services/staffService';
import { getTaskInstances } from '@/services/taskService';

// Cache for expensive data
let forecastCache: {
  data: ForecastData | null;
  expiry: Date | null;
} = {
  data: null,
  expiry: null
};

/**
 * Calculate forecast data for a given horizon
 * @param horizon Forecast time horizon
 * @param mode Forecast mode (virtual or actual)
 * @param useCache Whether to use cached data if available
 * @returns Promise with forecast data
 */
export const calculateForecast = async (
  horizon: ForecastHorizon,
  mode: ForecastMode = 'virtual',
  useCache: boolean = true
): Promise<ForecastData> => {
  // Check if we have valid cached data
  const now = new Date();
  if (
    useCache && 
    forecastCache.data && 
    forecastCache.expiry && 
    forecastCache.expiry > now &&
    forecastCache.data.horizon === horizon &&
    forecastCache.data.mode === mode
  ) {
    return forecastCache.data;
  }
  
  // Calculate start and end dates for the forecast period
  const { startDate, endDate } = calculateForecastDates(horizon);
  
  // Fetch all required data in parallel
  const [clients, staff, tasks] = await Promise.all([
    getActiveClients(),
    getAllStaffMembers(),
    getTaskInstances()
  ]);
  
  // Calculate demand and capacity
  const demand = await calculateDemand(tasks, startDate, endDate, mode);
  const capacity = await calculateCapacity(staff, startDate, endDate, mode);
  
  // Calculate gaps between demand and capacity
  const gap = calculateGap(demand, capacity);
  
  // Calculate financial projections
  const financials = calculateFinancialProjections(clients, demand, capacity);
  
  // Create the forecast data object
  const forecastData: ForecastData = {
    horizon,
    mode,
    timeframe: {
      startDate,
      endDate
    },
    demand,
    capacity,
    gap,
    financials,
    timestamp: now
  };
  
  // Cache the result for 30 minutes
  const cacheExpiry = new Date();
  cacheExpiry.setMinutes(cacheExpiry.getMinutes() + 30);
  forecastCache = {
    data: forecastData,
    expiry: cacheExpiry
  };
  
  return forecastData;
};

/**
 * Calculate start and end dates for the forecast period
 * @param horizon Forecast time horizon
 * @returns Object with start and end dates
 */
function calculateForecastDates(horizon: ForecastHorizon): { startDate: Date, endDate: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(today);
  const endDate = new Date(today);
  
  switch (horizon) {
    case 'week':
      // Next 7 days
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'month':
      // Next 30 days
      endDate.setDate(endDate.getDate() + 30);
      break;
    case 'quarter':
      // Next 90 days
      endDate.setDate(endDate.getDate() + 90);
      break;
    case 'year':
      // Next 365 days
      endDate.setDate(endDate.getDate() + 365);
      break;
    case 'custom':
      // Default to next 30 days for custom
      endDate.setDate(endDate.getDate() + 30);
      break;
  }
  
  return { startDate, endDate };
}

/**
 * Calculate demand forecast based on tasks
 * @param tasks List of task instances
 * @param startDate Start date of the forecast period
 * @param endDate End date of the forecast period
 * @param mode Forecast mode
 * @returns Promise with demand forecast
 */
async function calculateDemand(
  tasks: TaskInstance[],
  startDate: Date,
  endDate: Date,
  mode: ForecastMode
): Promise<ForecastDemand> {
  // Filter tasks to those within the time period
  const inPeriodTasks = tasks.filter(task => {
    const taskDate = task.dueDate;
    return taskDate && taskDate >= startDate && taskDate <= endDate;
  });
  
  // Initialize demand object with skill breakdowns
  const totalHours = inPeriodTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  
  // Group by skill
  const skillBreakdowns: Record<SkillType, SkillBreakdown> = {} as Record<SkillType, SkillBreakdown>;
  
  const skillList: SkillType[] = ['Junior', 'Senior', 'CPA', 'Tax Specialist', 'Audit', 'Advisory', 'Bookkeeping'];
  
  // Initialize skill breakdowns
  skillList.forEach(skill => {
    skillBreakdowns[skill] = {
      skillType: skill,
      hours: 0,
      taskCount: 0,
      percentage: 0,
      tasks: []
    };
  });
  
  // Calculate hours and task count by skill
  inPeriodTasks.forEach(task => {
    task.requiredSkills.forEach(skill => {
      if (skillBreakdowns[skill]) {
        // Evenly distribute hours among required skills
        const hoursPerSkill = task.estimatedHours / task.requiredSkills.length;
        skillBreakdowns[skill].hours += hoursPerSkill;
        skillBreakdowns[skill].taskCount += 1;
        skillBreakdowns[skill].tasks.push({
          id: task.id,
          name: task.name,
          hours: hoursPerSkill,
          dueDate: task.dueDate!
        });
      }
    });
  });
  
  // Calculate percentages
  if (totalHours > 0) {
    Object.keys(skillBreakdowns).forEach(skill => {
      const typedSkill = skill as SkillType;
      skillBreakdowns[typedSkill].percentage = 
        (skillBreakdowns[typedSkill].hours / totalHours) * 100;
    });
  }
  
  // Group by time period (week, day, or month depending on horizon)
  const timeBreakdown: SkillDemandData[] = [];
  
  // Create simplified time breakdown (just for demo)
  // In a real app, this would be grouped by time periods
  Object.keys(skillBreakdowns).forEach(skill => {
    const typedSkill = skill as SkillType;
    if (skillBreakdowns[typedSkill].hours > 0) {
      timeBreakdown.push({
        skillType: typedSkill,
        hours: skillBreakdowns[typedSkill].hours,
        startDate: startDate,
        endDate: endDate
      });
    }
  });
  
  return {
    totalHours,
    taskCount: inPeriodTasks.length,
    skillBreakdowns,
    timeBreakdown
  };
}

/**
 * Calculate capacity forecast based on staff availability
 * @param staff List of staff members
 * @param startDate Start date of the forecast period
 * @param endDate End date of the forecast period
 * @param mode Forecast mode
 * @returns Promise with capacity forecast
 */
async function calculateCapacity(
  staff: StaffMember[],
  startDate: Date,
  endDate: Date,
  mode: ForecastMode
): Promise<ForecastCapacity> {
  // Get all staff availability
  let totalHours = 0;
  const skillBreakdowns: Record<SkillType, SkillBreakdown> = {} as Record<SkillType, SkillBreakdown>;
  
  const skillList: SkillType[] = ['Junior', 'Senior', 'CPA', 'Tax Specialist', 'Audit', 'Advisory', 'Bookkeeping'];
  
  // Initialize skill breakdowns
  skillList.forEach(skill => {
    skillBreakdowns[skill] = {
      skillType: skill,
      hours: 0,
      taskCount: 0, // For capacity, this is staff count
      percentage: 0,
      tasks: []
    };
  });
  
  // Process each staff member
  for (const member of staff) {
    // For demo purposes, we're just going to estimate capacity
    // In a real app, we'd query the availability data
    
    // Assume 8 hours per workday, 5 days per week
    const workdaysInPeriod = getWorkdaysInPeriod(startDate, endDate);
    const staffHours = workdaysInPeriod * 8 * 0.8; // 80% availability to account for breaks, meetings, etc.
    
    // Distribute hours evenly among the staff's skills
    const hoursPerSkill = staffHours / member.skills.length;
    
    member.skills.forEach(skill => {
      if (skillBreakdowns[skill]) {
        skillBreakdowns[skill].hours += hoursPerSkill;
        skillBreakdowns[skill].taskCount += 1; // Count of staff with this skill
      }
    });
    
    totalHours += staffHours;
  }
  
  // Calculate percentages
  if (totalHours > 0) {
    Object.keys(skillBreakdowns).forEach(skill => {
      const typedSkill = skill as SkillType;
      skillBreakdowns[typedSkill].percentage = 
        (skillBreakdowns[typedSkill].hours / totalHours) * 100;
    });
  }
  
  // Group by time period (week, day, or month depending on horizon)
  const timeBreakdown: SkillDemandData[] = [];
  
  // Create simplified time breakdown (just for demo)
  Object.keys(skillBreakdowns).forEach(skill => {
    const typedSkill = skill as SkillType;
    if (skillBreakdowns[typedSkill].hours > 0) {
      timeBreakdown.push({
        skillType: typedSkill,
        hours: skillBreakdowns[typedSkill].hours,
        startDate: startDate,
        endDate: endDate
      });
    }
  });
  
  return {
    totalHours,
    staffCount: staff.length,
    skillBreakdowns,
    timeBreakdown
  };
}

/**
 * Calculate gaps between demand and capacity
 * @param demand Demand forecast
 * @param capacity Capacity forecast
 * @returns Gap analysis
 */
function calculateGap(demand: ForecastDemand, capacity: ForecastCapacity): ForecastGap {
  const totalGap = capacity.totalHours - demand.totalHours;
  const skillGaps: Record<SkillType, GapAnalysis> = {} as Record<SkillType, GapAnalysis>;
  
  // Calculate gap for each skill
  const skillList: SkillType[] = ['Junior', 'Senior', 'CPA', 'Tax Specialist', 'Audit', 'Advisory', 'Bookkeeping'];
  
  skillList.forEach(skill => {
    const demandHours = demand.skillBreakdowns[skill]?.hours || 0;
    const capacityHours = capacity.skillBreakdowns[skill]?.hours || 0;
    const gapHours = capacityHours - demandHours;
    const utilizationPercentage = demandHours > 0 && capacityHours > 0 
      ? (demandHours / capacityHours) * 100
      : 0;
    
    skillGaps[skill] = {
      skillType: skill,
      demandHours,
      capacityHours,
      gapHours,
      isSurplus: gapHours >= 0,
      utilizationPercentage,
      status: getGapStatus(gapHours, capacityHours)
    };
  });
  
  return {
    totalGap,
    hasSurplus: totalGap >= 0,
    utilizationPercentage: capacity.totalHours > 0 
      ? (demand.totalHours / capacity.totalHours) * 100
      : 0,
    skillGaps
  };
}

/**
 * Determine the status of a capacity gap
 * @param gapHours Hours gap (positive for surplus, negative for shortage)
 * @param capacityHours Total capacity hours
 * @returns Gap status string
 */
function getGapStatus(gapHours: number, capacityHours: number): 'critical' | 'warning' | 'healthy' | 'excess' {
  if (capacityHours === 0) return 'critical';
  
  const gapPercentage = (gapHours / capacityHours) * 100;
  
  if (gapPercentage < -20) return 'critical';
  if (gapPercentage < 0) return 'warning';
  if (gapPercentage < 20) return 'healthy';
  return 'excess';
}

/**
 * Calculate financial projections based on clients and forecasts
 * @param clients List of active clients
 * @param demand Demand forecast
 * @param capacity Capacity forecast
 * @returns Financial projections
 */
function calculateFinancialProjections(
  clients: Client[],
  demand: ForecastDemand,
  capacity: ForecastCapacity
): FinancialProjection {
  // Calculate expected revenue from all active clients
  const monthlyRevenue = clients.reduce((sum, client) => {
    return sum + client.expectedMonthlyRevenue;
  }, 0);
  
  // For simplicity, we'll assume costs are based on capacity
  // In a real app, this would be based on staff costs per hour
  const averageCostPerHour = 75; // Example average cost per hour
  const projectedCost = capacity.totalHours * averageCostPerHour;
  
  // Calculate expected revenue for the demand
  // In a real app, this would be more complex based on billing rates
  const averageBillingRate = 150; // Example average billing rate
  const projectedRevenue = demand.totalHours * averageBillingRate;
  
  // Calculate profit
  const projectedProfit = projectedRevenue - projectedCost;
  const profitMargin = projectedRevenue > 0 
    ? (projectedProfit / projectedRevenue) * 100
    : 0;
  
  return {
    monthlyRecurringRevenue: monthlyRevenue,
    projectedRevenue,
    projectedCost,
    projectedProfit,
    profitMargin,
    revenueAtRisk: 0, // This would be calculated based on at-risk clients
    skillBreakdown: {} // This would break down financials by skill
  };
}

/**
 * Helper function to count workdays in a period
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of workdays in the period
 */
function getWorkdaysInPeriod(startDate: Date, endDate: Date): number {
  let workdays = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Skip weekends (0 = Sunday, 6 = Saturday)
      workdays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workdays;
}

/**
 * Get the cached forecast data
 * @returns The cached forecast data or null if not available
 */
export const getCachedForecast = (): ForecastData | null => {
  const now = new Date();
  
  if (forecastCache.data && forecastCache.expiry && forecastCache.expiry > now) {
    return forecastCache.data;
  }
  
  return null;
};

/**
 * Clear the forecast cache
 * @returns Void
 */
export const clearForecastCache = (): void => {
  forecastCache = {
    data: null,
    expiry: null
  };
};
