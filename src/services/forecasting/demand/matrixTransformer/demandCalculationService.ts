
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from '../clientResolutionService';
import { MonthlyDemandCalculationService } from './monthlyDemandCalculationService';
import { debugLog } from '../../logger';

/**
 * Demand Calculation Service - FIXED
 * Handles all demand calculations with proper monthly demand calculation
 */
export class DemandCalculationService {
  /**
   * FIXED: Calculate demand for a specific skill and period using proper monthly calculation
   */
  static calculateDemandForSkillPeriod(
    skill: string,
    forecastPeriod: ForecastData,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): {
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
  } {
    let totalDemand = 0;
    let totalTasks = 0;
    const clientsSet = new Set<string>();

    debugLog(`FIXED: Calculating demand for skill: ${skill}, period: ${forecastPeriod.period}`);

    // Filter tasks by skill and check if they're due in this month
    const skillTasks = tasks.filter(task => {
      const taskSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
      const hasSkill = taskSkills.some(taskSkill => {
        const mappedSkill = skillMapping.get(taskSkill);
        return mappedSkill === skill || taskSkill === skill;
      });
      
      if (!hasSkill) return false;
      
      // FIXED: Check if task is due in this specific month
      return MonthlyDemandCalculationService.shouldTaskAppearInMonth(task, forecastPeriod.period);
    });

    for (const task of skillTasks) {
      // FIXED: Use proper monthly demand calculation
      const monthlyDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, forecastPeriod.period);
      
      if (monthlyDemand.monthlyHours > 0) {
        totalDemand += monthlyDemand.monthlyHours;
        totalTasks++;
        clientsSet.add(task.client_id);
      }
    }

    debugLog(`FIXED: Calculated demand for skill ${skill} in period ${forecastPeriod.period}:`, {
      totalDemand,
      totalTasks,
      totalClients: clientsSet.size,
      tasksIncluded: skillTasks.length
    });

    return {
      totalDemand,
      totalTasks,
      totalClients: clientsSet.size
    };
  }

  /**
   * FIXED: Generate task breakdown with proper monthly demand calculation
   */
  static async generateTaskBreakdownForSkillPeriod(
    skill: string,
    forecastPeriod: ForecastData,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    const taskBreakdown: ClientTaskDemand[] = [];

    try {
      // Filter tasks by skill and check if they're due in this month
      const skillTasks = tasks.filter(task => {
        const taskSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
        const hasSkill = taskSkills.some(taskSkill => {
          const mappedSkill = skillMapping.get(taskSkill);
          return mappedSkill === skill || taskSkill === skill;
        });
        
        if (!hasSkill) return false;
        
        // FIXED: Check if task is due in this specific month
        return MonthlyDemandCalculationService.shouldTaskAppearInMonth(task, forecastPeriod.period);
      });

      // Collect unique client IDs for batch resolution
      const clientIds = [...new Set(skillTasks.map(task => task.client_id))];
      const clientResolutionMap = await ClientResolutionService.resolveClientIds(clientIds);

      for (const task of skillTasks) {
        try {
          const clientInfo = clientResolutionMap.get(task.client_id);
          if (!clientInfo) {
            console.warn(`Could not resolve client for task ${task.id}`);
            continue;
          }

          // FIXED: Calculate proper monthly demand for this task in this specific month
          const monthlyDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, forecastPeriod.period);

          // Only include if there's actual demand in this month
          if (monthlyDemand.monthlyHours > 0) {
            const taskDemand: ClientTaskDemand = {
              clientId: task.client_id,
              clientName: clientInfo,
              recurringTaskId: task.id,
              taskName: task.name,
              skillType: skill,
              estimatedHours: task.estimated_hours,
              recurrencePattern: {
                type: task.recurrence_type,
                interval: task.recurrence_interval || 1,
                frequency: monthlyDemand.monthlyOccurrences
              },
              monthlyHours: monthlyDemand.monthlyHours, // FIXED: Use calculated monthly hours
              preferredStaffId: task.preferred_staff_id || null,
              preferredStaffName: null
            };

            taskBreakdown.push(taskDemand);
          }
        } catch (taskError) {
          console.warn(`Error processing task ${task.id}:`, taskError);
        }
      }

      debugLog(`FIXED: Generated task breakdown for skill ${skill} in period ${forecastPeriod.period}:`, {
        totalTasks: taskBreakdown.length,
        totalHours: taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0)
      });

      return taskBreakdown;

    } catch (error) {
      console.error('Error generating task breakdown:', error);
      return [];
    }
  }

  /**
   * FIXED: Calculate monthly demand for a single task using the new service
   */
  static calculateMonthlyDemandForTask(
    task: RecurringTaskDB,
    forecastPeriod: ForecastData
  ): { monthlyOccurrences: number; monthlyHours: number } {
    try {
      // FIXED: Use the new monthly demand calculation service
      const result = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, forecastPeriod.period);

      debugLog(`FIXED: Calculated monthly demand for task ${task.id} in period ${forecastPeriod.period}:`, {
        recurrenceType: task.recurrence_type,
        interval: task.recurrence_interval,
        estimatedHours: task.estimated_hours,
        monthlyOccurrences: result.monthlyOccurrences,
        monthlyHours: result.monthlyHours,
        wasIncluded: result.monthlyHours > 0 ? 'YES' : 'NO'
      });

      return result;

    } catch (error) {
      console.error(`Error calculating monthly demand for task ${task.id}:`, error);
      return {
        monthlyOccurrences: 0,
        monthlyHours: 0
      };
    }
  }
}
