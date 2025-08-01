import { addMonths, isSameMonth, isSameYear, parseISO, format } from 'date-fns';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { ClientTaskDemand, RecurrenceCalculation } from '@/types/demand';
import { debugLog } from '../logger';
import { normalizeStaffId } from '@/utils/staffIdUtils';

/**
 * PHASE 2 FIX: Skill Calculator Service - Enhanced with consistent staff ID normalization
 * Uses shared normalization utility to ensure consistent staff ID data types
 */
export class SkillCalculator {
  /**
   * PHASE 2 FIX: Calculate monthly demand by skill with normalized staff IDs
   */
  static async calculateMonthlyDemandBySkill(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): Promise<Array<{ skill: SkillType; hours: number; tasks: ClientTaskDemand[] }>> {
    debugLog(`PHASE 2: Calculating monthly demand for ${format(monthStart, 'MMM yyyy')} with normalized staff IDs`);

    const skillDemandMap = new Map<SkillType, { hours: number; tasks: ClientTaskDemand[] }>();

    console.log(`🔍 [SKILL CALCULATOR] PHASE 2: Processing ${tasks.length} tasks with normalization`);
    
    // Log sample task staff data
    const tasksWithStaff = tasks.filter(task => task.preferred_staff_id);
    console.log(`🔍 [SKILL CALCULATOR] Tasks with preferred staff: ${tasksWithStaff.length}/${tasks.length}`);
    
    if (tasksWithStaff.length > 0) {
      const sampleTask = tasksWithStaff[0];
      console.log(`🔍 [SKILL CALCULATOR] PHASE 2: Sample task staff data:`, {
        taskName: sampleTask.name,
        preferred_staff_id: sampleTask.preferred_staff_id,
        preferred_staff_id_type: typeof sampleTask.preferred_staff_id,
        staff_full_name: sampleTask.staff?.full_name,
        staff_id: sampleTask.staff?.id,
        staff_id_type: typeof sampleTask.staff?.id
      });
    }

    for (const task of tasks) {
      if (!task.required_skills || task.required_skills.length === 0) {
        continue;
      }

      // Calculate recurrence for this month
      const recurrenceCalc = await this.calculateTaskRecurrence(task, monthStart, monthEnd);
      if (recurrenceCalc.monthlyOccurrences === 0) {
        continue;
      }

      // PHASE 2 FIX: Use shared normalization utility for consistent formatting
      const normalizedStaffId = normalizeStaffId(task.preferred_staff_id);
      
      console.log(`🔍 [SKILL CALCULATOR] PHASE 2: Task staff ID normalization:`, {
        taskName: task.name,
        originalStaffId: task.preferred_staff_id,
        originalStaffIdType: typeof task.preferred_staff_id,
        normalizedStaffId: normalizedStaffId,
        staffName: task.staff?.full_name,
        normalizationApplied: task.preferred_staff_id ? String(task.preferred_staff_id) !== normalizedStaffId : false
      });

      // PHASE 2 FIX: Include normalized preferred staff information in task breakdown
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
        // PHASE 2 FIX: Use normalized staff ID for consistent filtering
        preferredStaffId: normalizedStaffId,
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

    console.log(`✅ [SKILL CALCULATOR] PHASE 2 COMPLETE: Processed ${tasks.length} tasks for ${result.length} skills with normalized staff IDs`);
    
    // PHASE 2: Log staff ID normalization statistics
    const allTasksInResult = result.flatMap(r => r.tasks);
    const tasksWithPreferredStaff = allTasksInResult.filter(t => t.preferredStaffId);
    const uniqueStaffIds = new Set(tasksWithPreferredStaff.map(t => t.preferredStaffId));
    
    console.log(`📊 [SKILL CALCULATOR] PHASE 2: Staff ID normalization statistics:`, {
      totalTasks: allTasksInResult.length,
      tasksWithPreferredStaff: tasksWithPreferredStaff.length,
      uniqueNormalizedStaffIds: Array.from(uniqueStaffIds),
      normalizedStaffIdFormats: Array.from(uniqueStaffIds).map(id => ({
        id,
        length: id?.length,
        isLowercase: id === id?.toLowerCase(),
        isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '')
      })),
      coveragePercentage: ((tasksWithPreferredStaff.length / allTasksInResult.length) * 100).toFixed(1)
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
