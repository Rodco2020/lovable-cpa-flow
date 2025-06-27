import { debugLog } from '../../logger';
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from '../clientResolutionService';

/**
 * Consistent Demand Calculation Service
 * Provides unified calculation logic for demand across different matrix transformers
 */
export class ConsistentDemandCalculation {
  /**
   * Calculate demand for a specific skill and period with task breakdown
   */
  static async calculateDemandForSkillPeriod(
    skill: string,
    forecastPeriod: ForecastData,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<{
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
    taskBreakdown: ClientTaskDemand[];
  }> {
    let totalDemand = 0;
    let totalTasks = 0;
    const clientsSet = new Set<string>();
    const taskBreakdown: ClientTaskDemand[] = [];

    debugLog(`Calculating demand for skill: ${skill}, period: ${forecastPeriod.period}`);

    try {
      // Filter tasks by skill using the skill mapping
      const skillTasks = tasks.filter(task => {
        const taskSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
        return taskSkills.some(taskSkill => {
          const mappedSkill = skillMapping.get(taskSkill);
          return mappedSkill === skill || taskSkill === skill;
        });
      });

      debugLog(`Found ${skillTasks.length} tasks for skill ${skill}`);

      // Collect unique client IDs for resolution
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
            totalDemand += monthlyDemand.monthlyHours;
            totalTasks++;
            clientsSet.add(task.client_id);

            // Create task breakdown entry
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

      return {
        totalDemand,
        totalTasks,
        totalClients: clientsSet.size,
        taskBreakdown
      };

    } catch (error) {
      console.error('Error in calculateDemandForSkillPeriod:', error);
      return {
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        taskBreakdown: []
      };
    }
  }

  /**
   * Calculate monthly demand for a single task
   */
  private static calculateMonthlyDemandForTask(
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
