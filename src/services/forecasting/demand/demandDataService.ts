import { supabase } from '@/lib/supabase';
import { DemandMatrixData } from '@/types/demand';
import { ClientResolutionService } from './clientResolutionService';

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
 * Handles data fetching and processing for demand forecasting with client name resolution
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
      console.log('🔍 [DEMAND DATA SERVICE] Generating demand forecast with client resolution...');
      
      // Fetch recurring tasks
      const { data: recurringTasks, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('is_active', !filters.includeInactive);

      if (error) {
        throw new Error(`Failed to fetch recurring tasks: ${error.message}`);
      }

      // Process data into matrix format with client resolution
      const matrixData = await this.processTasksIntoMatrix(recurringTasks || [], timeHorizon);
      
      // Calculate summary
      const summary = {
        totalTasks: matrixData.totalTasks,
        totalHours: matrixData.totalDemand,
        totalClients: matrixData.totalClients
      };

      console.log('✅ [DEMAND DATA SERVICE] Demand forecast generated with client resolution:', {
        matrixDataPoints: matrixData.dataPoints.length,
        summaryTotalTasks: summary.totalTasks,
        summaryTotalHours: summary.totalHours,
        summaryTotalClients: summary.totalClients
      });

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
   * Process recurring tasks into matrix data structure with client name resolution
   */
  private static async processTasksIntoMatrix(tasks: any[], timeHorizon: TimeHorizon): Promise<DemandMatrixData> {
    console.log('🔍 [DEMAND DATA SERVICE] Processing tasks into matrix with client resolution...');
    
    // Generate months within the time horizon
    const months = this.generateMonthsInRange(timeHorizon.start, timeHorizon.end);
    
    // Extract unique skills
    const skills = [...new Set(tasks.flatMap(task => task.required_skills || []))];
    
    // Extract unique client IDs for batch resolution
    const allClientIds = [...new Set(tasks.map(task => task.client_id).filter(Boolean))];
    console.log('🔍 [DEMAND DATA SERVICE] Resolving client IDs:', allClientIds);
    
    // Batch resolve client IDs to client names
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(allClientIds);
    console.log('✅ [DEMAND DATA SERVICE] Client resolution complete:', Array.from(clientResolutionMap.entries()));
    
    // Generate data points with resolved client names
    const dataPoints = this.generateDataPoints(tasks, months, skills, clientResolutionMap);
    
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
    
    // Generate client totals using resolved names
    const clientTotals = new Map<string, number>();
    tasks.forEach(task => {
      const resolvedClientName = clientResolutionMap.get(task.client_id) || `Client ${task.client_id.substring(0, 8)}...`;
      const currentTotal = clientTotals.get(resolvedClientName) || 0;
      clientTotals.set(resolvedClientName, currentTotal + (task.estimated_hours || 0));
    });

    console.log('✅ [DEMAND DATA SERVICE] Matrix processing complete with client resolution:', {
      totalDataPoints: dataPoints.length,
      resolvedClients: clientResolutionMap.size,
      clientTotalsEntries: clientTotals.size
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
   * Generate data points for the matrix with resolved client names
   */
  private static generateDataPoints(
    tasks: any[], 
    months: any[], 
    skills: string[], 
    clientResolutionMap: Map<string, string>
  ) {
    const dataPoints = [];
    
    for (const month of months) {
      for (const skill of skills) {
        const skillTasks = tasks.filter(task => 
          task.required_skills && task.required_skills.includes(skill)
        );
        
        if (skillTasks.length > 0) {
          const totalHours = skillTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
          
          // Create task breakdown with resolved client names
          const taskBreakdown = skillTasks.map(task => {
            const resolvedClientName = clientResolutionMap.get(task.client_id) || `Client ${task.client_id.substring(0, 8)}...`;
            
            console.log(`🔍 [DEMAND DATA SERVICE] Task breakdown: ${task.client_id} -> ${resolvedClientName}`);
            
            return {
              clientId: task.client_id,
              clientName: resolvedClientName, // Use resolved client name
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
            };
          });
          
          dataPoints.push({
            skillType: skill,
            month: month.key,
            monthLabel: month.label,
            demandHours: totalHours,
            totalHours: totalHours,
            taskCount: skillTasks.length,
            clientCount: new Set(skillTasks.map(task => task.client_id)).size,
            taskBreakdown
          });
        }
      }
    }
    
    return dataPoints;
  }
}
