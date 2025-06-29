
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';

export interface SkillHours {
  skillType: string;
  hours: number;
}

export interface FilterContext {
  hasStaffFilter?: boolean;
  hasSkillFilter?: boolean;
  preferredStaffIds?: string[];
  skillTypes?: string[];
}

/**
 * Matrix Transformer Core
 * 
 * Core transformation utilities for matrix data
 */
export class MatrixTransformerCore {
  
  /**
   * Transform forecast data to matrix format
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    filterContext?: FilterContext
  ): Promise<DemandMatrixData> {
    // Basic implementation - can be enhanced later
    if (!forecastData || !tasks) {
      return {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        },
        aggregationStrategy: filterContext?.hasStaffFilter ? 'staff-based' : 'skill-based'
      };
    }

    // Extract months from forecast data
    const months = forecastData.map(fd => ({
      key: fd.period,
      label: fd.period
    }));

    // Extract skills from forecast data and tasks
    const skillsFromForecast = forecastData.flatMap(fd => 
      fd.demand?.map(d => d.skill) || []
    );
    const skillsFromTasks = tasks.flatMap(task => task.required_skills || []);
    const skills = [...new Set([...skillsFromForecast, ...skillsFromTasks])];

    // Generate basic data points
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
              preferredStaffName: task.preferred_staff_id ? `Staff ${task.preferred_staff_id}` : undefined
            }))
          });
        }
      }
    }

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
        clientCount: uniqueClients.size,
        totalSuggestedRevenue: 0,
        totalExpectedLessSuggested: 0,
        averageFeeRate: 0
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
      clientRevenue: new Map(),
      clientHourlyRates: new Map(),
      clientSuggestedRevenue: new Map(),
      clientExpectedLessSuggested: new Map(),
      revenueTotals: {
        totalSuggestedRevenue: 0,
        totalExpectedRevenue: 0,
        totalExpectedLessSuggested: 0
      },
      aggregationStrategy: filterContext?.hasStaffFilter ? 'staff-based' : 'skill-based'
    };
  }
  
  /**
   * Transform skill hours data
   */
  static transformSkillHours(skillHours: SkillHours[]): SkillHours[] {
    if (!skillHours || !Array.isArray(skillHours)) {
      return [];
    }
    
    return skillHours.map(item => ({
      skillType: item.skillType,
      hours: item.hours
    }));
  }
  
  /**
   * Aggregate skill hours by skill type
   */
  static aggregateSkillHours(skillHours: SkillHours[]): Map<string, number> {
    const aggregated = new Map<string, number>();
    
    skillHours.forEach(item => {
      const currentTotal = aggregated.get(item.skillType) || 0;
      aggregated.set(item.skillType, currentTotal + item.hours);
    });
    
    return aggregated;
  }
  
  /**
   * Filter skill hours by minimum threshold
   */
  static filterByMinimumHours(skillHours: SkillHours[], minimumHours: number): SkillHours[] {
    return skillHours.filter(item => item.hours >= minimumHours);
  }
}
