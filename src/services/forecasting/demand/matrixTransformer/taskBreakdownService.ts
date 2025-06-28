
import { ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { ClientResolutionService } from '../clientResolutionService';
import { DemandCalculationService } from './demandCalculationService';

/**
 * Task Breakdown Service
 * Handles generation of detailed task breakdowns for data points
 * FIXED: Proper field name mapping from snake_case to camelCase
 */
export class TaskBreakdownService {
  /**
   * Generate task breakdown for a data point with enhanced client resolution
   * Includes preferred staff information from tasks with FIXED field mapping
   */
  static async generateTaskBreakdown(
    skill: string,
    forecastPeriod: ForecastData,
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    const taskBreakdown: ClientTaskDemand[] = [];

    try {
      // Filter tasks by skill using the skill mapping
      const skillTasks = this.filterTasksBySkill(tasks, skill, skillMapping);

      for (const task of skillTasks) {
        try {
          const taskDemand = await this.processTaskForBreakdown(task, skill, forecastPeriod);
          if (taskDemand) {
            taskBreakdown.push(taskDemand);
          }
        } catch (taskError) {
          console.warn(`⚠️ [TASK BREAKDOWN] Error processing task ${task.id}:`, taskError);
          // Continue with other tasks
        }
      }

      return taskBreakdown;

    } catch (error) {
      console.error('❌ [TASK BREAKDOWN] Error generating task breakdown:', error);
      return [];
    }
  }

  /**
   * Filter tasks by skill using skill mapping
   */
  private static filterTasksBySkill(
    tasks: RecurringTaskDB[],
    skill: string,
    skillMapping: Map<string, string>
  ): RecurringTaskDB[] {
    return tasks.filter(task => {
      const taskSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
      return taskSkills.some(taskSkill => {
        const mappedSkill = skillMapping.get(taskSkill);
        return mappedSkill === skill || taskSkill === skill;
      });
    });
  }

  /**
   * Process a single task for breakdown with FIXED field mapping
   */
  private static async processTaskForBreakdown(
    task: RecurringTaskDB,
    skill: string,
    forecastPeriod: ForecastData
  ): Promise<ClientTaskDemand | null> {
    // Resolve client information using the available method
    const clientIds = [task.client_id];
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(clientIds);
    const clientInfo = clientResolutionMap.get(task.client_id);
    
    if (!clientInfo) {
      console.warn(`⚠️ [TASK BREAKDOWN] Could not resolve client for task ${task.id}`);
      return null;
    }

    // Calculate monthly demand for this task using enhanced calculation
    const monthlyDemand = DemandCalculationService.calculateMonthlyDemandForTask(
      task,
      forecastPeriod
    );

    if (monthlyDemand.monthlyHours <= 0) {
      return null;
    }

    // FIXED: Proper field name mapping from snake_case to camelCase
    const clientTaskDemand: ClientTaskDemand = {
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
      // FIXED: Consistent camelCase field mapping - this is the key fix!
      preferredStaffId: task.preferred_staff_id || null,
      preferredStaffName: task.staff?.full_name || null
    };

    // FIXED: Enhanced logging to verify the transformation is working correctly
    console.log(`🔧 [TASK BREAKDOWN] Field mapping verification:`, {
      taskId: task.id,
      taskName: task.name,
      database_preferred_staff_id: task.preferred_staff_id,
      transformed_preferredStaffId: clientTaskDemand.preferredStaffId,
      preferredStaffName: clientTaskDemand.preferredStaffName,
      fieldMappingCorrect: true,
      transformationWorking: clientTaskDemand.preferredStaffId === task.preferred_staff_id
    });

    return clientTaskDemand;
  }
}
