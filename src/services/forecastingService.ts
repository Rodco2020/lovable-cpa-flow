
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, addWeeks, addMonths, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { 
  ForecastData, 
  ForecastMode, 
  ForecastHorizon,
  ForecastDemand,
  ForecastCapacity,
  ForecastGap,
  FinancialProjection,
  SkillBreakdown,
  SkillDemandData,
  GapAnalysis,
  SkillAllocationStrategy,
  SkillData,
  ForecastParameters,
  ForecastResult
} from '@/types/forecasting';
import { 
  TaskInstance, 
  RecurringTask
} from '@/types/task';
import { StaffMember, StaffAvailability } from '@/types/staff';
import { Client } from '@/types/client';
import { getAllClients } from '@/services/clientService';
import { getAllStaffMembers, getAvailabilitySummary } from '@/services/staffService';
import { getTaskInstances, getRecurringTasks } from '@/services/taskService';
import { estimateRecurringTaskInstances } from '@/utils/forecastTestingUtils';

// Global state for forecast settings
let debugMode = false;
let skillAllocationStrategy: SkillAllocationStrategy = 'duplicate';

// Constants
const SKILL_COLORS: Record<string, string> = {
  'Tax': '#4f46e5',
  'Bookkeeping': '#10b981',
  'Audit': '#f59e0b',
  'Advisory': '#ef4444',
  'Payroll': '#8b5cf6',
  'Compliance': '#ec4899',
  'Default': '#6b7280'
};

// Get forecast
export async function getForecast(
  mode: ForecastMode = 'virtual',
  horizon: ForecastHorizon = 'month',
  customDateRange?: { startDate: Date; endDate: Date }
): Promise<ForecastData> {
  console.log(`Getting ${mode} forecast for ${horizon} horizon`);
  
  // Determine date range based on horizon
  const dateRange = getDateRangeForHorizon(horizon, customDateRange);
  
  // Get demand
  const demand = await calculateDemand(mode, dateRange);
  
  // Get capacity
  const capacity = await calculateCapacity(mode, dateRange);
  
  // Calculate gap
  const gap = calculateGap(demand, capacity);
  
  // Calculate financial projections
  const financialProjection = await calculateFinancialProjection(demand);
  
  // Create time series data
  const timeSeriesData = createTimeSeriesData(demand, capacity, dateRange);
  
  // Create skill distribution data
  const skillDistribution = createSkillDistributionData(demand, capacity);
  
  // Create result data
  const result: ForecastData = {
    horizon,
    mode,
    timeframe: dateRange,
    demand,
    capacity,
    gap,
    financials: financialProjection,
    timestamp: new Date(),
    period: formatPeriod(horizon, dateRange),
    data: timeSeriesData,
    skillDistribution,
    demandHours: demand.totalHours,
    capacityHours: capacity.totalHours,
    gapHours: gap.totalGap,
    projectedRevenue: financialProjection.projectedRevenue,
    projectedCost: financialProjection.projectedCost,
    projectedProfit: financialProjection.projectedProfit,
    financialProjections: createFinancialTimeSeriesData(demand, financialProjection, dateRange),
    summary: {
      totalDemand: demand.totalHours,
      totalCapacity: capacity.totalHours,
      gap: gap.totalGap,
      totalRevenue: financialProjection.projectedRevenue,
      totalCost: financialProjection.projectedCost,
      totalProfit: financialProjection.projectedProfit
    }
  };
  
  return result;
}

// Format period display
function formatPeriod(horizon: ForecastHorizon, dateRange: { startDate: Date; endDate: Date }): string {
  const start = format(dateRange.startDate, 'MMM d, yyyy');
  const end = format(dateRange.endDate, 'MMM d, yyyy');
  
  switch (horizon) {
    case 'week':
      return `Week of ${start}`;
    case 'month':
      return format(dateRange.startDate, 'MMMM yyyy');
    case 'quarter':
      const quarter = Math.floor((dateRange.startDate.getMonth() / 3)) + 1;
      const year = dateRange.startDate.getFullYear();
      return `Q${quarter} ${year}`;
    case 'year':
      return format(dateRange.startDate, 'yyyy');
    case 'custom':
      return `${start} - ${end}`;
    default:
      return `${start} - ${end}`;
  }
}

// Get date range for horizon
function getDateRangeForHorizon(
  horizon: ForecastHorizon,
  customDateRange?: { startDate: Date; endDate: Date }
): { startDate: Date; endDate: Date } {
  const today = startOfDay(new Date());
  
  if (horizon === 'custom' && customDateRange) {
    return {
      startDate: startOfDay(customDateRange.startDate),
      endDate: endOfDay(customDateRange.endDate)
    };
  }
  
  switch (horizon) {
    case 'week':
      return {
        startDate: today,
        endDate: endOfDay(addDays(today, 6))
      };
    case 'month':
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today)
      };
    case 'quarter':
      const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      return {
        startDate: startOfDay(quarterStart),
        endDate: endOfDay(addDays(addMonths(quarterStart, 3), -1))
      };
    case 'year':
      return {
        startDate: new Date(today.getFullYear(), 0, 1),
        endDate: new Date(today.getFullYear(), 11, 31)
      };
    default:
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today)
      };
  }
}

// Calculate demand forecast
async function calculateDemand(
  mode: ForecastMode,
  dateRange: { startDate: Date; endDate: Date }
): Promise<ForecastDemand> {
  const skillBreakdowns: Record<string, SkillBreakdown> = {};
  const timeBreakdown: SkillDemandData[] = [];
  let totalHours = 0;
  let taskCount = 0;
  
  if (mode === 'virtual') {
    // Virtual demand is based on recurring tasks
    const recurringTasks = await getRecurringTasks();
    
    for (const task of recurringTasks) {
      // Skip inactive tasks
      if (!task.isActive) continue;
      
      // Estimate task instances in date range
      const instances = estimateRecurringTaskInstances(task.templateId, dateRange.startDate, dateRange.endDate);
      const instanceCount = Math.max(1, instances.length); // At least one instance
      
      // Calculate hours
      const hours = task.estimatedHours * instanceCount;
      totalHours += hours;
      taskCount += instanceCount;
      
      // Handle skills based on allocation strategy
      if (skillAllocationStrategy === 'duplicate') {
        // Duplicate hours across all skills
        for (const skill of Array.isArray(task.requiredSkills) ? task.requiredSkills : [task.requiredSkills]) {
          if (!skillBreakdowns[skill]) {
            skillBreakdowns[skill] = {
              skillType: skill,
              hours: 0,
              taskCount: 0,
              percentage: 0,
              tasks: []
            };
          }
          
          skillBreakdowns[skill].hours += hours;
          skillBreakdowns[skill].taskCount += instanceCount;
          skillBreakdowns[skill].tasks.push({
            id: task.id,
            name: task.name,
            hours: hours
          });
          
          // Add to time breakdown
          timeBreakdown.push({
            skillType: skill,
            hours: hours,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
        }
      } else {
        // Distribute hours evenly across skills
        const skillsArray = Array.isArray(task.requiredSkills) ? task.requiredSkills : [task.requiredSkills];
        const hoursPerSkill = hours / skillsArray.length;
        
        for (const skill of skillsArray) {
          if (!skillBreakdowns[skill]) {
            skillBreakdowns[skill] = {
              skillType: skill,
              hours: 0,
              taskCount: 0,
              percentage: 0,
              tasks: []
            };
          }
          
          skillBreakdowns[skill].hours += hoursPerSkill;
          skillBreakdowns[skill].taskCount += instanceCount;
          skillBreakdowns[skill].tasks.push({
            id: task.id,
            name: task.name,
            hours: hoursPerSkill
          });
          
          // Add to time breakdown
          timeBreakdown.push({
            skillType: skill,
            hours: hoursPerSkill,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
        }
      }
    }
  } else {
    // Actual demand is based on generated task instances
    const taskInstances = await getTaskInstances({});
    const filteredInstances = taskInstances.filter(
      task => task.dueDate && task.dueDate >= dateRange.startDate && task.dueDate <= dateRange.endDate
    );
    
    taskCount = filteredInstances.length;
    
    for (const task of filteredInstances) {
      // Skip completed tasks
      if (task.status === 'Completed') continue;
      
      // Calculate hours
      const hours = task.estimatedHours;
      totalHours += hours;
      
      // Handle skills based on allocation strategy
      if (skillAllocationStrategy === 'duplicate') {
        // Duplicate hours across all skills
        for (const skill of Array.isArray(task.requiredSkills) ? task.requiredSkills : [task.requiredSkills]) {
          if (!skillBreakdowns[skill]) {
            skillBreakdowns[skill] = {
              skillType: skill,
              hours: 0,
              taskCount: 0,
              percentage: 0,
              tasks: []
            };
          }
          
          skillBreakdowns[skill].hours += hours;
          skillBreakdowns[skill].taskCount += 1;
          skillBreakdowns[skill].tasks.push({
            id: task.id,
            name: task.name,
            hours: hours
          });
          
          // Add to time breakdown
          timeBreakdown.push({
            skillType: skill,
            hours: hours,
            startDate: task.dueDate || dateRange.startDate,
            endDate: task.dueDate || dateRange.endDate
          });
        }
      } else {
        // Distribute hours evenly across skills
        const skillsArray = Array.isArray(task.requiredSkills) ? task.requiredSkills : [task.requiredSkills];
        const hoursPerSkill = hours / skillsArray.length;
        
        for (const skill of skillsArray) {
          if (!skillBreakdowns[skill]) {
            skillBreakdowns[skill] = {
              skillType: skill,
              hours: 0,
              taskCount: 0,
              percentage: 0,
              tasks: []
            };
          }
          
          skillBreakdowns[skill].hours += hoursPerSkill;
          skillBreakdowns[skill].taskCount += 1;
          skillBreakdowns[skill].tasks.push({
            id: task.id,
            name: task.name,
            hours: hoursPerSkill
          });
          
          // Add to time breakdown
          timeBreakdown.push({
            skillType: skill,
            hours: hoursPerSkill,
            startDate: task.dueDate || dateRange.startDate,
            endDate: task.dueDate || dateRange.endDate
          });
        }
      }
    }
  }
  
  // Calculate percentages
  for (const key in skillBreakdowns) {
    if (totalHours > 0) {
      skillBreakdowns[key].percentage = (skillBreakdowns[key].hours / totalHours) * 100;
    } else {
      skillBreakdowns[key].percentage = 0;
    }
  }
  
  // Add forEach and find methods to make it compatible with UI components
  const demand: ForecastDemand = {
    totalHours,
    taskCount,
    skillBreakdowns,
    timeBreakdown,
    forEach: function(callback) {
      Object.values(this.skillBreakdowns).forEach(callback);
    },
    find: function(predicate) {
      return Object.values(this.skillBreakdowns).find(predicate);
    }
  };
  
  return demand;
}

// Calculate capacity forecast
async function calculateCapacity(
  mode: ForecastMode,
  dateRange: { startDate: Date; endDate: Date }
): Promise<ForecastCapacity> {
  const skillBreakdowns: Record<string, SkillBreakdown> = {};
  const timeBreakdown: SkillDemandData[] = [];
  let totalHours = 0;
  
  // Get staff
  const staff = await getAllStaffMembers();
  const activeStaff = staff.filter(s => s.status === 'Active');
  
  for (const member of activeStaff) {
    // Get availability summary for this staff member
    const availabilitySummary = await getAvailabilitySummary(member.id);
    
    // Calculate hours based on mode
    let staffHours = 0;
    
    if (mode === 'virtual') {
      // Virtual capacity is based on weekly availability template
      // Calculate number of work weeks in the date range
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = days / 7;
      
      staffHours = availabilitySummary.totalWeeklyHours * weeks;
    } else {
      // Actual capacity would be based on actual staff availability
      // Accounting for time off, etc.
      // For this implementation, we'll just use the same calculation as virtual
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = days / 7;
      
      staffHours = availabilitySummary.totalWeeklyHours * weeks;
    }
    
    totalHours += staffHours;
    
    // Distribute hours by skill
    for (const skill of member.skills) {
      const hoursForSkill = staffHours / member.skills.length;
      
      if (!skillBreakdowns[skill]) {
        skillBreakdowns[skill] = {
          skillType: skill,
          hours: 0,
          taskCount: 0,
          percentage: 0,
          tasks: []
        };
      }
      
      skillBreakdowns[skill].hours += hoursForSkill;
      
      // Add to time breakdown
      timeBreakdown.push({
        skillType: skill,
        hours: hoursForSkill,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
    }
  }
  
  // Calculate percentages
  for (const key in skillBreakdowns) {
    if (totalHours > 0) {
      skillBreakdowns[key].percentage = (skillBreakdowns[key].hours / totalHours) * 100;
    } else {
      skillBreakdowns[key].percentage = 0;
    }
  }
  
  // Add forEach and find methods to make it compatible with UI components
  const capacity: ForecastCapacity = {
    totalHours,
    staffCount: activeStaff.length,
    skillBreakdowns,
    timeBreakdown,
    forEach: function(callback) {
      Object.values(this.skillBreakdowns).forEach(callback);
    },
    find: function(predicate) {
      return Object.values(this.skillBreakdowns).find(predicate);
    }
  };
  
  return capacity;
}

// Calculate gap between demand and capacity
function calculateGap(demand: ForecastDemand, capacity: ForecastCapacity): ForecastGap {
  const totalDemand = demand.totalHours;
  const totalCapacity = capacity.totalHours;
  const totalGap = totalCapacity - totalDemand;
  const hasSurplus = totalGap >= 0;
  const utilizationPercentage = totalCapacity > 0 ? (totalDemand / totalCapacity) * 100 : 0;
  
  // Calculate gaps by skill
  const skillGaps: Record<string, GapAnalysis> = {};
  
  // Merge all skill types from both demand and capacity
  const allSkills = new Set<string>();
  Object.keys(demand.skillBreakdowns).forEach(skill => allSkills.add(skill));
  Object.keys(capacity.skillBreakdowns).forEach(skill => allSkills.add(skill));
  
  allSkills.forEach(skill => {
    const demandHours = demand.skillBreakdowns[skill]?.hours || 0;
    const capacityHours = capacity.skillBreakdowns[skill]?.hours || 0;
    const gapHours = capacityHours - demandHours;
    const isSurplus = gapHours >= 0;
    const utilizationPercent = capacityHours > 0 ? (demandHours / capacityHours) * 100 : 0;
    
    // Determine status
    let status: GapAnalysis['status'] = 'healthy';
    if (!isSurplus) {
      status = utilizationPercent > 120 ? 'critical' : 'warning';
    } else if (utilizationPercent < 50) {
      status = 'excess';
    }
    
    skillGaps[skill] = {
      skillType: skill,
      demandHours,
      capacityHours,
      gapHours,
      isSurplus,
      utilizationPercentage: utilizationPercent,
      status
    };
  });
  
  return {
    totalGap,
    hasSurplus,
    utilizationPercentage,
    skillGaps
  };
}

// Calculate financial projection
async function calculateFinancialProjection(demand: ForecastDemand): Promise<FinancialProjection> {
  // Get clients for revenue projection
  const clients = await getAllClients();
  const monthlyRecurringRevenue = clients.reduce((sum, client) => sum + client.expectedMonthlyRevenue, 0);
  
  // Calculate cost based on demand
  const costPerHour = 85; // Average cost per hour
  const projectedCost = demand.totalHours * costPerHour;
  
  // Calculate revenue (simplified as monthly recurring revenue)
  const projectedRevenue = monthlyRecurringRevenue;
  
  // Calculate profit
  const projectedProfit = projectedRevenue - projectedCost;
  const profitMargin = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;
  
  return {
    monthlyRecurringRevenue,
    projectedRevenue,
    projectedCost,
    projectedProfit,
    profitMargin,
    revenueAtRisk: 0,
    period: 'Monthly',
    revenue: projectedRevenue,
    cost: projectedCost,
    profit: projectedProfit
  };
}

// Create time series data for charts
function createTimeSeriesData(
  demand: ForecastDemand,
  capacity: ForecastCapacity,
  dateRange: { startDate: Date; endDate: Date }
): any[] {
  // Create weekly buckets
  const result = [];
  let current = new Date(dateRange.startDate);
  let weekIndex = 1;
  
  while (current <= dateRange.endDate) {
    const weekEnd = addDays(current, 6);
    const weekLabel = `Week ${weekIndex}`;
    
    // Sum up demand and capacity for this week
    const demandHours = demand.timeBreakdown
      .filter(item => 
        (item.startDate <= weekEnd && item.endDate >= current)
      )
      .reduce((sum, item) => sum + item.hours, 0);
    
    const capacityHours = capacity.timeBreakdown
      .filter(item => 
        (item.startDate <= weekEnd && item.endDate >= current)
      )
      .reduce((sum, item) => sum + item.hours, 0);
    
    result.push({
      name: weekLabel,
      date: format(current, 'yyyy-MM-dd'),
      demand: Math.round(demandHours),
      capacity: Math.round(capacityHours),
      gap: Math.round(capacityHours - demandHours)
    });
    
    current = addDays(weekEnd, 1);
    weekIndex++;
  }
  
  return result;
}

// Create skill distribution data for charts
function createSkillDistributionData(
  demand: ForecastDemand,
  capacity: ForecastCapacity
): any[] {
  const result = [];
  
  // Merge all skill types from both demand and capacity
  const allSkills = new Set<string>();
  Object.keys(demand.skillBreakdowns).forEach(skill => allSkills.add(skill));
  Object.keys(capacity.skillBreakdowns).forEach(skill => allSkills.add(skill));
  
  allSkills.forEach(skill => {
    const demandHours = demand.skillBreakdowns[skill]?.hours || 0;
    const capacityHours = capacity.skillBreakdowns[skill]?.hours || 0;
    const color = SKILL_COLORS[skill] || SKILL_COLORS.Default;
    
    result.push({
      name: skill,
      demand: Math.round(demandHours),
      capacity: Math.round(capacityHours),
      color
    });
  });
  
  // Sort by descending demand hours
  return result.sort((a, b) => b.demand - a.demand);
}

// Create financial time series data for charts
function createFinancialTimeSeriesData(
  demand: ForecastDemand,
  financialProjection: FinancialProjection,
  dateRange: { startDate: Date; endDate: Date }
): FinancialProjection[] {
  // Create monthly buckets
  const result: FinancialProjection[] = [];
  let current = new Date(dateRange.startDate);
  
  while (current <= dateRange.endDate) {
    const monthEnd = endOfMonth(current);
    const periodLabel = format(current, 'MMM yyyy');
    
    // For simplicity, we'll just divide the financial projections evenly across months
    const monthRevenue = financialProjection.projectedRevenue;
    const monthCost = financialProjection.projectedCost;
    const monthProfit = monthRevenue - monthCost;
    const monthProfitMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0;
    
    result.push({
      period: periodLabel,
      projectedRevenue: monthRevenue,
      projectedCost: monthCost,
      projectedProfit: monthProfit,
      profitMargin: monthProfitMargin,
      revenue: monthRevenue,
      cost: monthCost,
      profit: monthProfit
    });
    
    current = addDays(monthEnd, 1);
  }
  
  return result;
}

// Get task breakdown for analysis
export async function getTaskBreakdown(): Promise<any[]> {
  try {
    const tasks = await getTaskInstances({});
    
    // Group tasks by status
    const byStatus: Record<string, number> = {};
    tasks.forEach(task => {
      if (!byStatus[task.status]) {
        byStatus[task.status] = 0;
      }
      byStatus[task.status]++;
    });
    
    // Group tasks by skill
    const bySkill: Record<string, number> = {};
    tasks.forEach(task => {
      const skills = Array.isArray(task.requiredSkills) ? task.requiredSkills : [task.requiredSkills];
      skills.forEach(skill => {
        if (!bySkill[skill]) {
          bySkill[skill] = 0;
        }
        bySkill[skill]++;
      });
    });
    
    // Group tasks by priority
    const byPriority: Record<string, number> = {};
    tasks.forEach(task => {
      if (!byPriority[task.priority]) {
        byPriority[task.priority] = 0;
      }
      byPriority[task.priority]++;
    });
    
    return [{
      totalTasks: tasks.length,
      breakdown: {
        byStatus,
        bySkill,
        byPriority
      }
    }];
  } catch (error) {
    console.error('Error getting task breakdown:', error);
    return [];
  }
}

// Check if forecast debug mode is enabled
export function isForecastDebugModeEnabled(): boolean {
  return debugMode;
}

// Set forecast debug mode
export function setForecastDebugMode(enabled: boolean): void {
  debugMode = enabled;
  console.log(`Forecast debug mode ${enabled ? 'enabled' : 'disabled'}`);
}

// Set the skill allocation strategy
export function setSkillAllocationStrategy(strategy: SkillAllocationStrategy): void {
  skillAllocationStrategy = strategy;
  console.log(`Skill allocation strategy set to: ${strategy}`);
}

// Get the current skill allocation strategy
export function getSkillAllocationStrategy(): SkillAllocationStrategy {
  return skillAllocationStrategy;
}

// Calculate forecast using parameters object
export async function calculateForecast(params: ForecastParameters): Promise<ForecastResult> {
  // Determine date range
  const dateRange = params.timeframe === 'custom' && params.dateRange
    ? params.dateRange
    : getDateRangeForHorizon(params.timeframe as ForecastHorizon);
  
  // Get forecast data
  const forecast = await getForecast(
    params.mode,
    params.timeframe as ForecastHorizon,
    dateRange
  );
  
  return {
    data: forecast.data || [],
    financials: forecast.financialProjections || [],
    summary: forecast.summary || {
      totalDemand: 0,
      totalCapacity: 0,
      gap: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0
    }
  };
}

// Get available skills
export function getAvailableSkills(): SkillData[] {
  return [
    { id: 'Tax', name: 'Tax', color: SKILL_COLORS.Tax },
    { id: 'Bookkeeping', name: 'Bookkeeping', color: SKILL_COLORS.Bookkeeping },
    { id: 'Audit', name: 'Audit', color: SKILL_COLORS.Audit },
    { id: 'Advisory', name: 'Advisory', color: SKILL_COLORS.Advisory },
    { id: 'Payroll', name: 'Payroll', color: SKILL_COLORS.Payroll },
    { id: 'Compliance', name: 'Compliance', color: SKILL_COLORS.Compliance }
  ];
}

// Validate the forecast system
export function validateForecastSystem(): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check if skill allocation strategy is valid
  if (skillAllocationStrategy !== 'duplicate' && skillAllocationStrategy !== 'distribute') {
    issues.push(`Invalid skill allocation strategy: ${skillAllocationStrategy}`);
  }
  
  // Add more validation checks as needed
  
  return {
    isValid: issues.length === 0,
    issues
  };
}
