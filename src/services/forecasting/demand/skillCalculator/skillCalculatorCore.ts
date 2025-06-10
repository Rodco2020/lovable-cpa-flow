
import { debugLog } from '../../logger';
import { SkillHours } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { RecurrenceCalculator } from '../recurrenceCalculator/recurrenceCalculator';
import { DataValidator } from '../dataValidator';
import { SkillValidationUtils } from './validationUtils';
import { AnnualTaskTracker } from './annualTaskTracker';
import { SkillDataProcessor } from './skillDataProcessor';

/**
 * Core skill calculation engine with enhanced annual task debugging
 */
export class SkillCalculatorCore {
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
      // Validate inputs
      const inputValidation = SkillValidationUtils.validateInputs(tasks, monthStart, monthEnd);
      if (!inputValidation.isValid) {
        console.error('❌ [SKILL CALCULATOR] Input validation failed:', inputValidation.errors);
        return [];
      }

      // Enhanced validation and debugging for annual tasks
      const annualTasks = tasks.filter(task => 
        task.recurrence_type && task.recurrence_type.toLowerCase().includes('annual')
      );

      if (annualTasks.length > 0) {
        this.logAnnualTasksAnalysis(annualTasks, periodMonth, periodMonthName);
      }

      // Clear annual task tracker for this calculation
      AnnualTaskTracker.clearTracker();

      // Validate tasks
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

      // Process tasks and calculate demand
      const { skillDemandMap, processingStats } = await this.processTasksForDemand(
        validTasks, 
        monthStart, 
        monthEnd,
        periodMonth
      );

      // Log processing summary
      this.logProcessingSummary(processingStats, periodMonthName);

      // Convert to SkillHours array
      const skillHours = SkillDataProcessor.convertToSkillHours(skillDemandMap, periodMonthName);

      console.log('🎯 [SKILL CALCULATOR] Final results with enhanced annual task handling:', {
        skillsWithDemand: skillHours.length,
        totalDemandHours: skillHours.reduce((sum, sh) => sum + sh.hours, 0),
        periodMonth: periodMonthName,
        annualTasksProcessed: processingStats.annualTasksProcessed,
        annualTasksIncluded: processingStats.annualTasksIncluded,
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
   * Process all tasks for demand calculation
   */
  private static async processTasksForDemand(
    validTasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date,
    periodMonth: number
  ): Promise<{
    skillDemandMap: Map<SkillType, number>;
    processingStats: {
      processedTaskCount: number;
      totalCalculatedHours: number;
      annualTasksProcessed: number;
      annualTasksIncluded: number;
    };
  }> {
    const skillDemandMap = new Map<SkillType, number>();
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
          AnnualTaskTracker.trackAnnualTask(task, recurrenceCalc.monthlyHours, periodMonth);
          if (recurrenceCalc.monthlyHours > 0) {
            annualTasksIncluded++;
          }
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
        SkillDataProcessor.updateSkillDemandMap(
          skillDemandMap,
          task.required_skills,
          recurrenceCalc.monthlyHours,
          { id: task.id, name: task.name, isAnnualTask }
        );

      } catch (taskError) {
        console.error(`❌ [SKILL CALCULATOR] Error processing task ${task.id}:`, taskError);
      }
    }

    return {
      skillDemandMap,
      processingStats: {
        processedTaskCount,
        totalCalculatedHours,
        annualTasksProcessed,
        annualTasksIncluded
      }
    };
  }

  /**
   * Log annual tasks analysis
   */
  private static logAnnualTasksAnalysis(
    annualTasks: RecurringTaskDB[],
    periodMonth: number,
    periodMonthName: string
  ): void {
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
        shouldIncludePrediction: AnnualTaskTracker.predictAnnualTaskInclusion(task, periodMonth)
      }))
    });
  }

  /**
   * Log processing summary
   */
  private static logProcessingSummary(
    stats: {
      processedTaskCount: number;
      totalCalculatedHours: number;
      annualTasksProcessed: number;
      annualTasksIncluded: number;
    },
    periodMonthName: string
  ): void {
    // Enhanced annual task summary
    if (stats.annualTasksProcessed > 0) {
      const summary = AnnualTaskTracker.getSummary();
      console.log('📈 [ANNUAL TASK SUMMARY]:', {
        totalAnnualTasks: summary.totalAnnualTasks,
        includedAnnualTasks: summary.includedAnnualTasks,
        excludedAnnualTasks: summary.excludedAnnualTasks,
        periodMonth: periodMonthName,
        detailedBreakdown: AnnualTaskTracker.getAllTrackedTasks()
      });
    }

    console.log('📊 [SKILL CALCULATOR] Processing summary:', {
      processedTasks: stats.processedTaskCount,
      totalCalculatedHours: stats.totalCalculatedHours,
      annualTasksProcessed: stats.annualTasksProcessed,
      annualTasksIncluded: stats.annualTasksIncluded,
      annualTasksSkipped: stats.annualTasksProcessed - stats.annualTasksIncluded
    });
  }
}
