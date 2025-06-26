import { addMonths, isSameMonth, isSameYear, parseISO, format } from 'date-fns';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { ClientTaskDemand, RecurrenceCalculation } from '@/types/demand';
import { debugLog } from '../logger';

/**
 * FIXED: Skill Calculator Service - Enhanced with preferred staff information
 * Calculates demand hours by skill with proper staff attribution
 */
export class SkillCalculator {
  /**
   * FIXED: Calculate monthly demand by skill including preferred staff information
   */
  static async calculateMonthlyDemandBySkill(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): Promise<Array<{ skill: SkillType; hours: number; tasks: ClientTaskDemand[] }>> {
    debugLog(`FIXED: Calculating monthly demand for ${format(monthStart, 'MMM yyyy')} with preferred staff info`);

    const skillDemandMap = new Map<SkillType, { hours: number; tasks: ClientTaskDemand[] }>();

    for (const task of tasks) {
      if (!task.required_skills || task.required_skills.length === 0) {
        continue;
      }

      // Calculate recurrence for this month
      const recurrenceCalc = await this.calculateTaskRecurrence(task, monthStart, monthEnd);
      if (recurrenceCalc.monthlyOccurrences === 0) {
        continue;
      }

      // FIXED: Include preferred staff information in task breakdown
      const taskDemand: ClientTaskDemand = {
        clientId: task.client_id,
        clientName: task.clients?.legal_name || 'Unknown Client',
        recurringTaskId: task.id,
        taskName: task.name,
        skillType: task.required_skills[0], // Primary skill
        estimatedHours: Number(task.estimated_hours),
        recurrencePattern: {
          type: task.recurrence_type,
          interval: task.recurrence_interval || 1,
          frequency: recurrenceCalc.monthlyOccurrences
        },
        monthlyHours: recurrenceCalc.monthlyHours,
        // FIXED: Add preferred staff information
        preferredStaffId: task.preferred_staff_id || undefined,
        preferredStaffName: task.staff?.full_name || undefined
      };

      // Process each required skill
      for (const skill of task.required_skills) {
        const currentSkillData = skillDemandMap.get(skill) || { hours: 0, tasks: [] };
        
        skillDemandMap.set(skill, {
          hours: currentSkillData.hours + recurrenceCalc.monthlyHours,
          tasks: [...currentSkillData.tasks, { ...taskDemand, skillType: skill }]
        });
      }
    }

    const result = Array.from(skillDemandMap.entries()).map(([skill, data]) => ({
      skill,
      hours: data.hours,
      tasks: data.tasks
    }));

    console.log(`✅ [SKILL CALCULATOR] FIXED: Processed ${tasks.length} tasks for ${result.length} skills with preferred staff info`);
    
    // Log preferred staff statistics
    const tasksWithPreferredStaff = result.flatMap(r => r.tasks).filter(t => t.preferredStaffId);
    console.log(`📊 [SKILL CALCULATOR] Preferred staff statistics:`, {
      totalTasks: result.flatMap(r => r.tasks).length,
      tasksWithPreferredStaff: tasksWithPreferredStaff.length,
      uniquePreferredStaff: new Set(tasksWithPreferredStaff.map(t => t.preferredStaffId)).size,
      coveragePercentage: ((tasksWithPreferredStaff.length / result.flatMap(r => r.tasks).length) * 100).toFixed(1)
    });

    return result;
  }

  /**
   * Calculate task recurrence within the given month
   */
  private static async calculateTaskRecurrence(
    task: RecurringTaskDB,
    monthStart: Date,
    monthEnd: Date
  ): Promise<RecurrenceCalculation> {
    let monthlyOccurrences = 0;
    const estimatedHours = Number(task.estimated_hours);

    switch (task.recurrence_type) {
      case 'Daily':
        monthlyOccurrences = this.calculateDailyOccurrences(task, monthStart, monthEnd);
        break;
      case 'Weekly':
        monthlyOccurrences = this.calculateWeeklyOccurrences(task, monthStart, monthEnd);
        break;
      case 'Monthly':
        monthlyOccurrences = this.calculateMonthlyOccurrences(task, monthStart, monthEnd);
        break;
      case 'Quarterly':
        monthlyOccurrences = this.calculateQuarterlyOccurrences(task, monthStart, monthEnd);
        break;
      case 'Annually':
        monthlyOccurrences = this.calculateAnnualOccurrences(task, monthStart, monthEnd);
        break;
      default:
        monthlyOccurrences = 0;
    }

    return {
      monthlyOccurrences,
      monthlyHours: monthlyOccurrences * estimatedHours,
      taskId: task.id,
      nextDueDates: [] // Could be enhanced to calculate actual dates
    };
  }

  private static calculateDailyOccurrences(task: RecurringTaskDB, monthStart: Date, monthEnd: Date): number {
    const interval = task.recurrence_interval || 1;
    const daysInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysInMonth / interval);
  }

  private static calculateWeeklyOccurrences(task: RecurringTaskDB, monthStart: Date, monthEnd: Date): number {
    const interval = task.recurrence_interval || 1;
    const weeksInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return Math.floor(weeksInMonth / interval);
  }

  private static calculateMonthlyOccurrences(task: RecurringTaskDB, monthStart: Date, monthEnd: Date): number {
    return isSameMonth(monthStart, new Date()) ? 1 : 0;
  }

  private static calculateQuarterlyOccurrences(task: RecurringTaskDB, monthStart: Date, monthEnd: Date): number {
    const currentMonth = monthStart.getMonth();
    return currentMonth % 3 === 0 ? 1 : 0;
  }

  private static calculateAnnualOccurrences(task: RecurringTaskDB, monthStart: Date, monthEnd: Date): number {
    return monthStart.getMonth() === 0 ? 1 : 0;
  }
}
