import { DemandMatrixData, DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { debugLog } from '../../logger';

/**
 * Phase 1: Enhanced Core Matrix Transformer with preferred staff preservation
 * Maintains existing functionality while adding preferred staff information to task breakdown
 */
export class CoreTransformer {
  /**
   * Phase 1: Enhanced transformation with preferred staff information preservation
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    debugLog('Starting matrix transformation with preferred staff preservation', {
      forecastDataLength: forecastData.length,
      tasksLength: tasks.length
    });

    try {
      // Generate months from forecast data
      const months = this.generateMonthsFromForecast(forecastData);
      
      // Extract unique skills from forecast data and tasks
      const skills = this.extractUniqueSkills(forecastData, tasks);
      
      // Phase 1: Enhanced data point transformation with preferred staff info
      const dataPoints = await this.transformDataPointsWithStaffInfo(forecastData, tasks, months, skills);
      
      // Calculate totals and summaries
      const totalDemand = dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const totalTasks = dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
      const totalClients = new Set(
        dataPoints.flatMap(point => 
          point.taskBreakdown?.map(task => task.clientId) || []
        )
      ).size;
      
      // Generate skill summary
      const skillSummary = this.generateSkillSummary(dataPoints, skills);
      
      const result: DemandMatrixData = {
        months,
        skills,
        dataPoints,
        totalDemand,
        totalTasks,
        totalClients,
        skillSummary
      };
      
      debugLog('Matrix transformation completed successfully', {
        monthsCount: months.length,
        skillsCount: skills.length,
        dataPointsCount: dataPoints.length,
        totalDemand,
        totalTasks,
        totalClients
      });
      
      return result;
      
    } catch (error) {
      console.error('Error in matrix transformation:', error);
      throw new Error(`Matrix transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Phase 1: Enhanced data points transformation with preferred staff information
   */
  private static async transformDataPointsWithStaffInfo(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    months: Array<{ key: string; label: string }>,
    skills: string[]
  ): Promise<DemandDataPoint[]> {
    const dataPoints: DemandDataPoint[] = [];

    for (const month of months) {
      for (const skill of skills) {
        // Find relevant forecast data for this month/skill combination
        const relevantForecast = forecastData.find(forecast => 
          forecast.month === month.key && 
          forecast.skillBreakdown.some(sb => sb.skillType === skill)
        );

        if (relevantForecast) {
          const skillData = relevantForecast.skillBreakdown.find(sb => sb.skillType === skill);
          
          if (skillData && skillData.demandHours > 0) {
            // Phase 1: Enhanced task breakdown with preferred staff information
            const taskBreakdown = await this.generateTaskBreakdownWithStaff(
              tasks, 
              month.key, 
              skill, 
              skillData.demandHours
            );

            const dataPoint: DemandDataPoint = {
              skillType: skill,
              month: month.key,
              monthLabel: month.label,
              demandHours: skillData.demandHours,
              taskCount: taskBreakdown.length,
              clientCount: new Set(taskBreakdown.map(task => task.clientId)).size,
              taskBreakdown
            };

            dataPoints.push(dataPoint);
          }
        }
      }
    }

    return dataPoints;
  }

  /**
   * Phase 1: NEW - Generate task breakdown with preferred staff information
   */
  private static async generateTaskBreakdownWithStaff(
    tasks: RecurringTaskDB[],
    month: string,
    skill: string,
    totalDemandHours: number
  ): Promise<ClientTaskDemand[]> {
    // Filter tasks that match the skill requirement
    const matchingTasks = tasks.filter(task => 
      task.required_skills && task.required_skills.includes(skill)
    );

    return matchingTasks.map(task => {
      // Calculate monthly hours based on recurrence pattern
      const monthlyHours = this.calculateMonthlyHours(task, totalDemandHours / matchingTasks.length);

      // Phase 1: Include preferred staff information in breakdown
      const taskBreakdown: ClientTaskDemand = {
        clientId: task.client_id,
        clientName: task.clients?.legal_name || `Client ${task.client_id}`,
        recurringTaskId: task.id,
        taskName: task.name,
        skillType: skill,
        estimatedHours: task.estimated_hours,
        recurrencePattern: {
          type: task.recurrence_type,
          interval: task.recurrence_interval || 1,
          frequency: this.calculateFrequency(task.recurrence_type, task.recurrence_interval)
        },
        monthlyHours,
        // Phase 1: NEW - Preferred staff information
        preferredStaffId: task.preferred_staff_id || undefined,
        preferredStaffName: task.preferred_staff_name || undefined
      };

      return taskBreakdown;
    });
  }

  private static generateMonthsFromForecast(forecastData: ForecastData[]): Array<{ key: string; label: string }> {
    const monthSet = new Set<string>();
    forecastData.forEach(forecast => monthSet.add(forecast.month));
    
    return Array.from(monthSet)
      .sort()
      .map(month => ({
        key: month,
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }));
  }

  private static extractUniqueSkills(forecastData: ForecastData[], tasks: RecurringTaskDB[]): string[] {
    const skillSet = new Set<string>();
    
    // Extract skills from forecast data
    forecastData.forEach(forecast => {
      forecast.skillBreakdown.forEach(skill => {
        skillSet.add(skill.skillType);
      });
    });
    
    // Extract skills from tasks
    tasks.forEach(task => {
      if (task.required_skills) {
        task.required_skills.forEach(skill => {
          skillSet.add(skill);
        });
      }
    });
    
    return Array.from(skillSet).sort();
  }

  private static generateSkillSummary(dataPoints: DemandDataPoint[], skills: string[]): Record<string, any> {
    const summary: Record<string, any> = {};
    
    skills.forEach(skill => {
      const skillPoints = dataPoints.filter(point => point.skillType === skill);
      
      summary[skill] = {
        totalHours: skillPoints.reduce((sum, point) => sum + point.demandHours, 0),
        taskCount: skillPoints.reduce((sum, point) => sum + point.taskCount, 0),
        clientCount: new Set(
          skillPoints.flatMap(point => 
            point.taskBreakdown?.map(task => task.clientId) || []
          )
        ).size
      };
    });
    
    return summary;
  }

  private static calculateMonthlyHours(task: RecurringTaskDB, defaultHours: number): number {
    // Simple calculation based on recurrence type
    switch (task.recurrence_type) {
      case 'Monthly':
        return task.estimated_hours;
      case 'Quarterly':
        return task.estimated_hours / 3;
      case 'Annually':
        return task.estimated_hours / 12;
      case 'Weekly':
        return task.estimated_hours * 4.33; // Average weeks per month
      case 'Daily':
        return task.estimated_hours * 30; // Average days per month
      default:
        return defaultHours;
    }
  }

  private static calculateFrequency(recurrenceType: string, interval?: number): number {
    const intervalValue = interval || 1;
    
    switch (recurrenceType) {
      case 'Daily':
        return 30 / intervalValue; // Times per month
      case 'Weekly':
        return 4.33 / intervalValue; // Times per month
      case 'Monthly':
        return 1 / intervalValue; // Times per month
      case 'Quarterly':
        return 1 / (3 * intervalValue); // Times per month
      case 'Annually':
        return 1 / (12 * intervalValue); // Times per month
      default:
        return 1;
    }
  }
}
