
import { RecurringTaskDB } from '@/types/task';
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { TransformationContext, StaffInformation } from './types';
import { MATRIX_TRANSFORMER_CONFIG, RECURRENCE_MULTIPLIERS } from './constants';

/**
 * Calculation Engine for Matrix Transformer
 * Handles core calculation logic for demand data points
 */
export class CalculationEngine {
  /**
   * Calculate demand for a specific skill and month combination
   */
  static calculateDemandForSkillMonth(
    forecastData: any[],
    tasks: RecurringTaskDB[],
    skill: string,
    month: string,
    staffInformation: StaffInformation[]
  ): Pick<DemandDataPoint, 'demandHours' | 'taskCount' | 'clientCount' | 'taskBreakdown'> {
    // Filter tasks using correct field names and handle array skills
    const relevantTasks = tasks.filter(task => {
      const hasSkill = task.required_skills && 
                      Array.isArray(task.required_skills) && 
                      task.required_skills.includes(skill);
      const isActive = task.status === 'Unscheduled' || task.is_active === true;
      return hasSkill && isActive;
    });
    
    let demandHours = 0;
    let taskCount = 0;
    const clientIds = new Set<string>();
    const taskBreakdown: ClientTaskDemand[] = [];
    
    // Create staff lookup for efficient name resolution
    const staffLookup = new Map(staffInformation.map(staff => [staff.id, staff.name]));
    
    relevantTasks.forEach(task => {
      const monthlyHours = this.calculateMonthlyHours(task, month);
      
      if (monthlyHours > 0) {
        demandHours += monthlyHours;
        taskCount++;
        clientIds.add(task.client_id);
        
        taskBreakdown.push({
          clientId: task.client_id,
          clientName: `Client ${task.client_id.slice(0, 8)}`,
          recurringTaskId: task.id,
          taskName: task.name,
          skillType: skill,
          estimatedHours: task.estimated_hours || MATRIX_TRANSFORMER_CONFIG.DEFAULT_ESTIMATED_HOURS,
          recurrencePattern: {
            type: task.recurrence_type || 'monthly',
            interval: task.recurrence_interval || 1,
            frequency: 1
          },
          monthlyHours,
          preferredStaffId: task.preferred_staff_id,
          preferredStaffName: task.preferred_staff_id ? staffLookup.get(task.preferred_staff_id) : undefined
        });
      }
    });
    
    return {
      demandHours,
      taskCount,
      clientCount: clientIds.size,
      taskBreakdown
    };
  }

  /**
   * Calculate monthly hours for a recurring task
   */
  private static calculateMonthlyHours(task: RecurringTaskDB, month: string): number {
    const estimatedHours = task.estimated_hours || MATRIX_TRANSFORMER_CONFIG.DEFAULT_ESTIMATED_HOURS;
    const recurrenceType = task.recurrence_type || 'monthly';
    const recurrenceInterval = task.recurrence_interval || 1;
    
    const multiplier = RECURRENCE_MULTIPLIERS[recurrenceType as keyof typeof RECURRENCE_MULTIPLIERS];
    
    if (!multiplier) {
      return estimatedHours;
    }
    
    return estimatedHours * multiplier / recurrenceInterval;
  }
}
