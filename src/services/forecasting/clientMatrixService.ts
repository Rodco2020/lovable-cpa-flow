
import { supabase } from '@/integrations/supabase/client';
import { ForecastMode, SkillType, ForecastData } from '@/types/forecasting';
import { debugLog } from './logger';

/**
 * Client Matrix Service
 * 
 * Dedicated service for client-specific matrix data operations.
 * Provides client-filtered forecasting data without impacting existing matrix services.
 */

interface ClientTaskPeriodData {
  clientId: string;
  taskCount: number;
  totalHours: number;
  skillBreakdown: Record<SkillType, number>;
  tasks: Array<{
    id: string;
    name: string;
    estimatedHours: number;
    requiredSkills: SkillType[];
    dueDate: string;
    category: string;
  }>;
}

interface ClientCapacityBreakdown {
  clientId: string;
  totalAllocatedHours: number;
  skillDistribution: Record<SkillType, {
    hours: number;
    taskCount: number;
    staffCount: number;
  }>;
  monthlyBreakdown: Record<string, number>; // YYYY-MM -> hours
}

/**
 * Fetch client's tasks within a specific date range
 */
export const getClientTasksForPeriod = async (
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<ClientTaskPeriodData> => {
  try {
    debugLog(`Fetching tasks for client ${clientId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch recurring tasks
    const { data: recurringTasks, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select(`
        id,
        name,
        estimated_hours,
        required_skills,
        category,
        is_active,
        recurrence_type
      `)
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (recurringError) throw recurringError;

    // Fetch task instances
    const { data: taskInstances, error: instancesError } = await supabase
      .from('task_instances')
      .select(`
        id,
        name,
        estimated_hours,
        required_skills,
        due_date,
        category,
        status
      `)
      .eq('client_id', clientId)
      .gte('due_date', startDate.toISOString())
      .lte('due_date', endDate.toISOString())
      .neq('status', 'Completed');

    if (instancesError) throw instancesError;

    // Process and combine data
    const allTasks = [
      ...(recurringTasks || []).map(task => ({
        id: task.id,
        name: task.name,
        estimatedHours: Number(task.estimated_hours || 0),
        requiredSkills: (task.required_skills || []) as SkillType[],
        dueDate: new Date().toISOString(), // Estimated based on recurrence
        category: task.category
      })),
      ...(taskInstances || []).map(task => ({
        id: task.id,
        name: task.name,
        estimatedHours: Number(task.estimated_hours || 0),
        requiredSkills: (task.required_skills || []) as SkillType[],
        dueDate: task.due_date || new Date().toISOString(),
        category: task.category
      }))
    ];

    // Calculate skill breakdown
    const skillBreakdown: Record<SkillType, number> = {};
    let totalHours = 0;

    allTasks.forEach(task => {
      totalHours += task.estimatedHours;
      task.requiredSkills.forEach(skill => {
        if (!skillBreakdown[skill]) {
          skillBreakdown[skill] = 0;
        }
        // Distribute hours evenly across required skills
        skillBreakdown[skill] += task.estimatedHours / task.requiredSkills.length;
      });
    });

    const result: ClientTaskPeriodData = {
      clientId,
      taskCount: allTasks.length,
      totalHours,
      skillBreakdown,
      tasks: allTasks
    };

    debugLog(`Client ${clientId} data: ${allTasks.length} tasks, ${totalHours} total hours`);
    return result;

  } catch (error) {
    console.error('Error fetching client tasks for period:', error);
    throw error;
  }
};

/**
 * Get client's capacity breakdown and skill distribution
 */
export const getClientCapacityBreakdown = async (
  clientId: string,
  dateRange: { startDate: Date; endDate: Date }
): Promise<ClientCapacityBreakdown> => {
  try {
    debugLog(`Generating capacity breakdown for client ${clientId}`);

    const taskData = await getClientTasksForPeriod(
      clientId,
      dateRange.startDate,
      dateRange.endDate
    );

    // Calculate skill distribution with additional metrics
    const skillDistribution: Record<SkillType, { hours: number; taskCount: number; staffCount: number }> = {};
    
    // Process tasks to build skill distribution
    taskData.tasks.forEach(task => {
      task.requiredSkills.forEach(skill => {
        if (!skillDistribution[skill]) {
          skillDistribution[skill] = { hours: 0, taskCount: 0, staffCount: 0 };
        }
        skillDistribution[skill].hours += task.estimatedHours / task.requiredSkills.length;
        skillDistribution[skill].taskCount += 1;
      });
    });

    // Generate monthly breakdown (simplified for this phase)
    const monthlyBreakdown: Record<string, number> = {};
    const currentDate = new Date(dateRange.startDate);
    
    while (currentDate <= dateRange.endDate) {
      const monthKey = currentDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyBreakdown[monthKey]) {
        monthlyBreakdown[monthKey] = 0;
      }
      // Distribute hours evenly across months for now
      monthlyBreakdown[monthKey] += taskData.totalHours / 12;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const result: ClientCapacityBreakdown = {
      clientId,
      totalAllocatedHours: taskData.totalHours,
      skillDistribution,
      monthlyBreakdown
    };

    debugLog(`Client ${clientId} capacity: ${taskData.totalHours} allocated hours across ${Object.keys(skillDistribution).length} skills`);
    return result;

  } catch (error) {
    console.error('Error generating client capacity breakdown:', error);
    throw error;
  }
};

/**
 * Generate client-specific matrix data
 */
export const generateClientSpecificMatrix = async (
  clientId: string,
  forecastType: ForecastMode,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<ForecastData[]> => {
  try {
    debugLog(`Generating client-specific matrix for client ${clientId}, type: ${forecastType}`);

    // Default to next 12 months if no date range provided
    const defaultStartDate = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 12);

    const effectiveDateRange = dateRange || {
      startDate: defaultStartDate,
      endDate: defaultEndDate
    };

    const capacityBreakdown = await getClientCapacityBreakdown(clientId, effectiveDateRange);

    // Generate monthly forecast data
    const forecastData: ForecastData[] = [];
    const startMonth = new Date(effectiveDateRange.startDate);
    
    for (let i = 0; i < 12; i++) {
      const currentMonth = new Date(startMonth);
      currentMonth.setMonth(startMonth.getMonth() + i);
      const monthKey = currentMonth.toISOString().substring(0, 7);
      
      const demand = Object.entries(capacityBreakdown.skillDistribution).map(([skill, data]) => ({
        skill: skill as SkillType,
        hours: data.hours / 12, // Distribute evenly across months
        metadata: {
          taskCount: data.taskCount,
          calculationNotes: `Client ${clientId} demand for ${monthKey}`
        }
      }));

      // For virtual mode, capacity would be based on staff availability
      // For actual mode, capacity would be based on scheduled assignments
      const capacity = demand.map(d => ({
        skill: d.skill,
        hours: d.hours * 1.2, // 20% buffer for capacity
        metadata: {
          calculationNotes: `Estimated capacity for client ${clientId} ${monthKey}`
        }
      }));

      forecastData.push({
        period: monthKey,
        demand,
        capacity,
        demandHours: demand.reduce((sum, d) => sum + d.hours, 0),
        capacityHours: capacity.reduce((sum, c) => sum + c.hours, 0),
        gapHours: capacity.reduce((sum, c) => sum + c.hours, 0) - demand.reduce((sum, d) => sum + d.hours, 0)
      });
    }

    debugLog(`Generated ${forecastData.length} months of client-specific matrix data`);
    return forecastData;

  } catch (error) {
    console.error('Error generating client-specific matrix:', error);
    throw error;
  }
};

/**
 * Cache management for client data
 */
class ClientMatrixCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  clearClient(clientId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(clientId)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

export const clientMatrixCache = new ClientMatrixCache();

/**
 * Cached version of getClientTasksForPeriod
 */
export const getCachedClientTasksForPeriod = async (
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<ClientTaskPeriodData> => {
  const cacheKey = `client-tasks-${clientId}-${startDate.toISOString()}-${endDate.toISOString()}`;
  
  let cached = clientMatrixCache.get(cacheKey);
  if (cached) {
    debugLog(`Cache hit for client tasks: ${cacheKey}`);
    return cached;
  }

  const data = await getClientTasksForPeriod(clientId, startDate, endDate);
  clientMatrixCache.set(cacheKey, data);
  debugLog(`Cache miss for client tasks, data cached: ${cacheKey}`);
  
  return data;
};

/**
 * Performance monitoring for client queries
 */
export const monitorClientQueryPerformance = async <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    debugLog(`Client query '${operationName}' completed in ${duration.toFixed(2)}ms`);
    
    if (duration > 2000) {
      console.warn(`Slow client query detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    debugLog(`Client query '${operationName}' failed after ${duration.toFixed(2)}ms`);
    throw error;
  }
};
