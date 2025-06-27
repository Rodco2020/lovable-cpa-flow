import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from '../clientResolutionService';
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
   * Calculate monthly demand for a single task
   */
  static calculateMonthlyDemandForTask(
    task: RecurringTaskDB,
    forecastPeriod: ForecastData
  ): { monthlyOccurrences: number; monthlyHours: number } {
    let monthlyOccurrences = 0;

    switch (task.recurrence_type) {
      case 'Daily':
        // Approximate daily tasks as occurring every weekday (22 days per month)
        monthlyOccurrences = 22;
        break;
      case 'Weekly':
        monthlyOccurrences = 4;
        break;
      case 'Monthly':
        monthlyOccurrences = 1;
        break;
      case 'Quarterly':
        monthlyOccurrences = 1 / 3;
        break;
      case 'Annual':
        monthlyOccurrences = 1 / 12;
        break;
      default:
        monthlyOccurrences = 1; // Default to monthly
    }

    const monthlyHours = monthlyOccurrences * task.estimated_hours;

    return {
      monthlyOccurrences,
      monthlyHours
    };
  }
}
