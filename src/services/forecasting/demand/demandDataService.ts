
import { supabase } from '@/lib/supabase';
import { DemandMatrixData } from '@/types/demand';

export interface DemandForecastResult {
  matrixData: DemandMatrixData;
  summary: {
    totalTasks: number;
    totalHours: number;
    totalClients: number;
  };
}

export interface DemandForecastFilters {
  includeInactive: boolean;
  clientFilter: boolean;
}

export interface TimeHorizon {
  start: Date;
  end: Date;
}

/**
 * Demand Data Service
 * 
 * Handles data fetching and processing for demand forecasting
 */
export class DemandDataService {
  
  /**
   * Generate demand forecast based on time horizon and filters
   */
  static async generateDemandForecast(
    timeHorizon: TimeHorizon,
    filters: DemandForecastFilters
  ): Promise<DemandForecastResult> {
    try {
      // Fetch recurring tasks
      const { data: recurringTasks, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('is_active', !filters.includeInactive);

      if (error) {
        throw new Error(`Failed to fetch recurring tasks: ${error.message}`);
      }

      // Process data into matrix format
      const matrixData = this.processTasksIntoMatrix(recurringTasks || [], timeHorizon);
      
      // Calculate summary
      const summary = {
        totalTasks: matrixData.totalTasks,
        totalHours: matrixData.totalDemand,
        totalClients: matrixData.totalClients
      };

      return {
        matrixData,
        summary
      };
    } catch (error) {
      console.error('Error generating demand forecast:', error);
      throw error;
    }
  }
  
  /**
   * Process recurring tasks into matrix data structure
   */
  private static processTasksIntoMatrix(tasks: any[], timeHorizon: TimeHorizon): DemandMatrixData {
    // Generate months within the time horizon
    const months = this.generateMonthsInRange(timeHorizon.start, timeHorizon.end);
    
    // Extract unique skills
    const skills = [...new Set(tasks.flatMap(task => task.required_skills || []))];
    
    // Generate data points
    const dataPoints = this.generateDataPoints(tasks, months, skills);
    
    // Calculate totals
    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const uniqueClients = new Set(tasks.map(task => task.client_id));
    
    // Generate skill summary
    const skillSummary: Record<string, any> = {};
    skills.forEach(skill => {
      const skillDataPoints = dataPoints.filter(dp => dp.skillType === skill);
      skillSummary[skill] = {
        totalHours: skillDataPoints.reduce((sum, dp) => sum + dp.totalHours, 0),
        demandHours: skillDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0),
        taskCount: skillDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0),
        clientCount: uniqueClients.size
      };
    });
    
    // Generate client totals
    const clientTotals = new Map<string, number>();
    tasks.forEach(task => {
      const currentTotal = clientTotals.get(task.client_id) || 0;
      clientTotals.set(task.client_id, currentTotal + (task.estimated_hours || 0));
    });

    return {
      months,
      skills,
      dataPoints,
      totalDemand,
      totalTasks,
      totalClients: uniqueClients.size,
      skillSummary,
      clientTotals,
      aggregationStrategy: 'skill-based'
    };
  }
  
  /**
   * Generate months within the specified range
   */
  private static generateMonthsInRange(start: Date, end: Date) {
    const months = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endDate = new Date(end.getFullYear(), end.getMonth(), 1);
    
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const label = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      months.push({ key, label });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }
  
  /**
   * Generate data points for the matrix
   */
  private static generateDataPoints(tasks: any[], months: any[], skills: string[]) {
    const dataPoints = [];
    
    for (const month of months) {
      for (const skill of skills) {
        const skillTasks = tasks.filter(task => 
          task.required_skills && task.required_skills.includes(skill)
        );
        
        if (skillTasks.length > 0) {
          const totalHours = skillTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
          
          dataPoints.push({
            skillType: skill,
            month: month.key,
            monthLabel: month.label,
            demandHours: totalHours,
            totalHours: totalHours,
            taskCount: skillTasks.length,
            clientCount: new Set(skillTasks.map(task => task.client_id)).size,
            taskBreakdown: skillTasks.map(task => ({
              clientId: task.client_id,
              clientName: `Client ${task.client_id}`,
              recurringTaskId: task.id,
              taskName: task.name,
              skillType: skill,
              estimatedHours: task.estimated_hours || 0,
              recurrencePattern: {
                type: task.recurrence_type || 'monthly',
                interval: task.recurrence_interval || 1,
                frequency: 1
              },
              monthlyHours: task.estimated_hours || 0,
              preferredStaffId: task.preferred_staff_id,
              preferredStaffName: task.preferred_staff_name
            }))
          });
        }
      }
    }
    
    return dataPoints;
  }
}
