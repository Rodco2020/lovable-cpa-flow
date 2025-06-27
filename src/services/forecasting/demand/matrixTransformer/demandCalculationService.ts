
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from '../clientResolutionService';
import { RecurrenceCalculator } from '../recurrenceCalculator';
import { debugLog } from '../../logger';

/**
 * Demand Calculation Service
 * Handles all demand calculations for the matrix transformer
 */
export class DemandCalculationService {
  /**
   * Calculate demand for a specific skill and period
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

    debugLog(`Calculating demand for skill: ${skill}, period: ${forecastPeriod.period}`);

    // Filter tasks by skill using the skill mapping
    const skillTasks = tasks.filter(task => {
      const taskSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
      return taskSkills.some(taskSkill => {
        const mappedSkill = skillMapping.get(taskSkill);
        return mappedSkill === skill || taskSkill === skill;
      });
    });

    for (const task of skillTasks) {
      const monthlyDemand = this.calculateMonthlyDemandForTask(task, forecastPeriod);
      
      if (monthlyDemand.monthlyHours > 0) {
        totalDemand += monthlyDemand.monthlyHours;
        totalTasks++;
        clientsSet.add(task.client_id);
      }
    }

    return {
      totalDemand,
      totalTasks,
      totalClients: clientsSet.size
    };
  }

  /**
   * Generate task breakdown with client resolution
   */
  static async generateTaskBreakdownForSkillPeriod(
    skill: string,
    forecastPeriod: ForecastData,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    const taskBreakdown: ClientTaskDemand[] = [];

    try {
      // Filter tasks by skill using the skill mapping
      const skillTasks = tasks.filter(task => {
        const taskSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
        return taskSkills.some(taskSkill => {
          const mappedSkill = skillMapping.get(taskSkill);
          return mappedSkill === skill || taskSkill === skill;
        });
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

          // Calculate monthly demand for this task
          const monthlyDemand = this.calculateMonthlyDemandForTask(task, forecastPeriod);

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
              monthlyHours: monthlyDemand.monthlyHours,
              preferredStaffId: task.preferred_staff_id || null,
              preferredStaffName: null // Will be resolved separately if needed
            };

            taskBreakdown.push(taskDemand);
          }
        } catch (taskError) {
          console.warn(`Error processing task ${task.id}:`, taskError);
          // Continue with other tasks
        }
      }

      return taskBreakdown;

    } catch (error) {
      console.error('Error generating task breakdown:', error);
      return [];
    }
  }

  /**
   * Calculate monthly demand for a single task using proper recurrence calculation
   * 
   * This method now uses the RecurrenceCalculator to properly handle different
   * recurrence patterns, intervals, and specific date ranges instead of using
   * static approximations.
   */
  static calculateMonthlyDemandForTask(
    task: RecurringTaskDB,
    forecastPeriod: ForecastData
  ): { monthlyOccurrences: number; monthlyHours: number } {
    try {
      // Parse the forecast period to get start and end dates
      const periodDate = new Date(forecastPeriod.period + '-01');
      const startDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
      const endDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);

      // Use RecurrenceCalculator for accurate monthly demand calculation
      const result = RecurrenceCalculator.calculateMonthlyDemand(task, startDate, endDate);

      debugLog(`Calculated monthly demand for task ${task.id} in period ${forecastPeriod.period}:`, {
        recurrenceType: task.recurrence_type,
        interval: task.recurrence_interval,
        estimatedHours: task.estimated_hours,
        monthlyOccurrences: result.monthlyOccurrences,
        monthlyHours: result.monthlyHours,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return {
        monthlyOccurrences: result.monthlyOccurrences,
        monthlyHours: result.monthlyHours
      };

    } catch (error) {
      console.error(`Error calculating monthly demand for task ${task.id}:`, error);
      // Return zero demand for failed calculations
      return {
        monthlyOccurrences: 0,
        monthlyHours: 0
      };
    }
  }
}
