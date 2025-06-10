
import { debugLog } from '../logger';
import { SkillHours } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { RecurrenceCalculator } from './recurrenceCalculator/recurrenceCalculator';
import { DataValidator } from './dataValidator';

/**
 * Enhanced Skill Calculator with comprehensive annual task debugging
 */
export class SkillCalculator {
  /**
   * Calculate monthly demand by skill with enhanced annual task debugging
   */
  static async calculateMonthlyDemandBySkill(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): Promise<SkillHours[]> {
    const periodMonth = monthStart.getMonth();
    const periodMonthName = monthStart.toLocaleString('default', { month: 'long' });

    console.log('🔍 [SKILL CALCULATOR] Starting calculation with enhanced annual task debugging:', {
      tasksCount: tasks.length,
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      periodMonth,
      periodMonthName
    });

    try {
      // Enhanced validation and debugging for annual tasks
      const annualTasks = tasks.filter(task => 
        task.recurrence_type && task.recurrence_type.toLowerCase().includes('annual')
      );

      if (annualTasks.length > 0) {
        console.log('🎯 [SKILL CALCULATOR] ANNUAL TASKS ANALYSIS:', {
          totalAnnualTasks: annualTasks.length,
          currentPeriod: `${periodMonthName} (${periodMonth})`,
          annualTasksDetails: annualTasks.map(task => ({
            id: task.id,
            name: task.name,
            clientId: task.client_id,
            estimatedHours: task.estimated_hours,
            dueDate: task.due_date,
            dueDateMonth: task.due_date ? new Date(task.due_date).getMonth() : null,
            dueDateMonthName: task.due_date ? new Date(task.due_date).toLocaleString('default', { month: 'long' }) : null,
            monthOfYear: task.month_of_year,
            monthOfYearName: task.month_of_year ? new Date(2025, task.month_of_year - 1).toLocaleString('default', { month: 'long' }) : null,
            dayOfMonth: task.day_of_month,
            shouldIncludePrediction: this.predictAnnualTaskInclusion(task, periodMonth)
          }))
        });
      }

      // Validate inputs
      if (!Array.isArray(tasks)) {
        console.error('❌ [SKILL CALCULATOR] Tasks parameter is not an array:', typeof tasks);
        return [];
      }

      if (!monthStart || !monthEnd || monthEnd <= monthStart) {
        console.error('❌ [SKILL CALCULATOR] Invalid date range:', { monthStart, monthEnd });
        return [];
      }

      const { validTasks, invalidTasks } = await DataValidator.validateRecurringTasks(tasks);
      
      console.log('✅ [SKILL CALCULATOR] Task validation results:', {
        totalInput: tasks.length,
        validTasks: validTasks.length,
        invalidTasks: invalidTasks.length,
        validationRate: ((validTasks.length / tasks.length) * 100).toFixed(1) + '%'
      });

      if (validTasks.length === 0) {
        console.warn('❌ [SKILL CALCULATOR] No valid tasks after validation');
        return [];
      }

      // Group by skill and calculate demand with enhanced annual task tracking
      const skillDemandMap = new Map<SkillType, number>();
      const annualTaskTracker = new Map<string, {
        taskId: string;
        taskName: string;
        clientId: string;
        estimatedHours: number;
        calculatedHours: number;
        wasIncluded: boolean;
        reason: string;
      }>();

      let processedTaskCount = 0;
      let totalCalculatedHours = 0;
      let annualTasksProcessed = 0;
      let annualTasksIncluded = 0;

      console.log('🔄 [SKILL CALCULATOR] Processing tasks for skill demand...');

      for (const task of validTasks) {
        try {
          processedTaskCount++;
          const isAnnualTask = task.recurrence_type && task.recurrence_type.toLowerCase().includes('annual');
          
          if (isAnnualTask) {
            annualTasksProcessed++;
          }

          console.log(`📝 [SKILL CALCULATOR] Processing task ${processedTaskCount}/${validTasks.length}:`, {
            taskId: task.id,
            taskName: task.name,
            clientId: task.client_id,
            estimatedHours: task.estimated_hours,
            requiredSkills: task.required_skills,
            recurrenceType: task.recurrence_type,
            isAnnualTask
          });

          // Calculate recurrence for this task within the month
          const recurrenceCalc = RecurrenceCalculator.calculateMonthlyDemand(
            task, 
            monthStart, 
            monthEnd
          );

          // Track annual tasks specifically
          if (isAnnualTask) {
            const wasIncluded = recurrenceCalc.monthlyHours > 0;
            let reason = 'Unknown';

            if (task.month_of_year !== null && task.month_of_year !== undefined) {
              const taskMonth = task.month_of_year - 1;
              reason = taskMonth === periodMonth ? 
                `Included: month_of_year (${task.month_of_year}) matches period month` :
                `Excluded: month_of_year (${task.month_of_year}) doesn't match period month (${periodMonth + 1})`;
            } else if (task.due_date) {
              const dueDateMonth = new Date(task.due_date).getMonth();
              reason = dueDateMonth === periodMonth ?
                `Included: due_date month matches period month` :
                `Excluded: due_date month doesn't match period month`;
            } else {
              reason = 'Excluded: no month information available';
            }

            annualTaskTracker.set(task.id, {
              taskId: task.id,
              taskName: task.name,
              clientId: task.client_id,
              estimatedHours: Number(task.estimated_hours),
              calculatedHours: recurrenceCalc.monthlyHours,
              wasIncluded,
              reason
            });

            if (wasIncluded) {
              annualTasksIncluded++;
            }

            console.log(`📊 [ANNUAL TASK TRACKING] ${task.name} (${task.id}):`, {
              estimatedHours: task.estimated_hours,
              calculatedHours: recurrenceCalc.monthlyHours,
              wasIncluded,
              reason,
              monthOfYear: task.month_of_year,
              dueDate: task.due_date
            });
          }

          console.log(`⏰ [SKILL CALCULATOR] Recurrence calculation for task ${task.id}:`, {
            monthlyOccurrences: recurrenceCalc.monthlyOccurrences,
            monthlyHours: recurrenceCalc.monthlyHours,
            taskEstimatedHours: task.estimated_hours,
            calculationMethod: `${task.estimated_hours} × ${recurrenceCalc.monthlyOccurrences} = ${recurrenceCalc.monthlyHours}`,
            wasIncluded: recurrenceCalc.monthlyHours > 0,
            isAnnualTask
          });

          totalCalculatedHours += recurrenceCalc.monthlyHours;

          // Process each required skill
          if (Array.isArray(task.required_skills)) {
            for (const skillId of task.required_skills) {
              if (typeof skillId === 'string' && skillId.trim().length > 0) {
                const skill = skillId.trim();
                
                console.log(`🔧 [SKILL CALCULATOR] Adding hours for skill "${skill}":`, {
                  currentHours: skillDemandMap.get(skill) || 0,
                  additionalHours: recurrenceCalc.monthlyHours,
                  taskId: task.id,
                  taskName: task.name,
                  isAnnualTask
                });

                const currentHours = skillDemandMap.get(skill) || 0;
                const newTotal = currentHours + recurrenceCalc.monthlyHours;
                skillDemandMap.set(skill, newTotal);

                console.log(`✨ [SKILL CALCULATOR] Skill "${skill}" updated:`, {
                  previousTotal: currentHours,
                  added: recurrenceCalc.monthlyHours,
                  newTotal: newTotal,
                  fromAnnualTask: isAnnualTask,
                  taskName: task.name
                });
              }
            }
          }
        } catch (taskError) {
          console.error(`❌ [SKILL CALCULATOR] Error processing task ${task.id}:`, taskError);
        }
      }

      // Enhanced annual task summary
      if (annualTasksProcessed > 0) {
        console.log('📈 [ANNUAL TASK SUMMARY]:', {
          totalAnnualTasks: annualTasksProcessed,
          includedAnnualTasks: annualTasksIncluded,
          excludedAnnualTasks: annualTasksProcessed - annualTasksIncluded,
          periodMonth: periodMonthName,
          detailedBreakdown: Array.from(annualTaskTracker.values())
        });
      }

      console.log('📊 [SKILL CALCULATOR] Processing summary:', {
        processedTasks: processedTaskCount,
        totalCalculatedHours: totalCalculatedHours,
        uniqueSkills: skillDemandMap.size,
        annualTasksProcessed,
        annualTasksIncluded,
        annualTasksSkipped: annualTasksProcessed - annualTasksIncluded,
        skillTotals: Object.fromEntries(skillDemandMap.entries())
      });

      // Convert to SkillHours array
      const skillHours: SkillHours[] = Array.from(skillDemandMap.entries())
        .map(([skill, hours]) => ({
          skill,
          hours: Math.max(0, hours),
          metadata: {
            staffCount: 0,
            staffIds: [],
            hoursBreakdown: {},
            calculationNotes: `Demand calculated for ${periodMonthName}. Total hours: ${hours}`
          }
        }))
        .filter(sh => sh.hours > 0)
        .sort((a, b) => b.hours - a.hours);

      console.log('🎯 [SKILL CALCULATOR] Final results with enhanced annual task handling:', {
        skillsWithDemand: skillHours.length,
        totalDemandHours: skillHours.reduce((sum, sh) => sum + sh.hours, 0),
        periodMonth: periodMonthName,
        annualTasksProcessed,
        annualTasksIncluded,
        topSkills: skillHours.slice(0, 5).map(sh => ({ skill: sh.skill, hours: sh.hours }))
      });

      debugLog(`Calculated demand for ${skillHours.length} skills with enhanced annual task handling`);
      return skillHours;

    } catch (error) {
      console.error('❌ [SKILL CALCULATOR] Critical error in calculateMonthlyDemandBySkill:', error);
      return [];
    }
  }

  /**
   * Predict if an annual task should be included in the current period
   */
  private static predictAnnualTaskInclusion(task: RecurringTaskDB, periodMonth: number): {
    shouldInclude: boolean;
    reason: string;
    confidence: 'High' | 'Medium' | 'Low';
  } {
    // Strategy 1: month_of_year (highest confidence)
    if (task.month_of_year !== null && task.month_of_year !== undefined) {
      const taskMonth = task.month_of_year - 1; // Convert 1-12 to 0-11
      return {
        shouldInclude: taskMonth === periodMonth,
        reason: `month_of_year=${task.month_of_year} (${taskMonth === periodMonth ? 'matches' : 'doesn\'t match'} period month ${periodMonth})`,
        confidence: 'High'
      };
    }

    // Strategy 2: due_date (medium confidence)
    if (task.due_date) {
      const dueDateMonth = new Date(task.due_date).getMonth();
      return {
        shouldInclude: dueDateMonth === periodMonth,
        reason: `due_date month=${dueDateMonth} (${dueDateMonth === periodMonth ? 'matches' : 'doesn\'t match'} period month ${periodMonth})`,
        confidence: 'Medium'
      };
    }

    // Strategy 3: no information (low confidence, exclude)
    return {
      shouldInclude: false,
      reason: 'No month information available',
      confidence: 'Low'
    };
  }

  /**
   * Aggregate skill hours across multiple periods
   */
  static aggregateSkillHours(skillHoursArray: SkillHours[][]): SkillHours[] {
    try {
      if (!Array.isArray(skillHoursArray) || skillHoursArray.length === 0) {
        return [];
      }

      const aggregatedMap = new Map<SkillType, number>();
      
      for (const periodSkillHours of skillHoursArray) {
        if (Array.isArray(periodSkillHours)) {
          for (const skillHour of periodSkillHours) {
            if (skillHour && typeof skillHour.skill === 'string' && typeof skillHour.hours === 'number') {
              const current = aggregatedMap.get(skillHour.skill) || 0;
              aggregatedMap.set(skillHour.skill, current + Math.max(0, skillHour.hours));
            }
          }
        }
      }

      return Array.from(aggregatedMap.entries())
        .map(([skill, hours]) => ({
          skill,
          hours,
          metadata: {
            calculationNotes: 'Aggregated across multiple periods'
          }
        }))
        .filter(sh => sh.hours > 0)
        .sort((a, b) => b.hours - a.hours);

    } catch (error) {
      console.error('Error aggregating skill hours:', error);
      return [];
    }
  }
}
