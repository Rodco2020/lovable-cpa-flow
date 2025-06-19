
import { debugLog } from '../../logger';
import { SkillHours } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { RecurrenceCalculator } from '../recurrenceCalculator/recurrenceCalculator';
import { DataValidator } from '../dataValidator';
import { SkillValidationUtils } from './validationUtils';
import { AnnualTaskTracker } from './annualTaskTracker';
import { SkillDataProcessor } from './skillDataProcessor';
import { MatrixCalculationMonitor } from '../matrixCalculationMonitor';

/**
 * Core skill calculation engine with enhanced weekday calculation logic
 * 
 * WEEKDAY CALCULATION DOCUMENTATION:
 * 
 * The system now supports accurate weekday-specific calculations for weekly recurring tasks.
 * Instead of using a fixed 4.33 weeks/month approximation, the system calculates based on:
 * 
 * Formula: estimatedHours × numberOfSelectedWeekdays × (30.44 days/month ÷ 7 days/week) ÷ recurrenceInterval
 * 
 * Examples:
 * - Task: 5 hours, Weekly (every 1 week), Weekdays: [1, 3, 5] (Mon, Wed, Fri)
 *   Calculation: 5 × 3 × 4.35 ÷ 1 = 65.25 hours/month
 * 
 * - Task: 8 hours, Bi-weekly (every 2 weeks), Weekdays: [2, 4] (Tue, Thu)
 *   Calculation: 8 × 2 × 4.35 ÷ 2 = 34.8 hours/month
 * 
 * - Task: 12 hours, Weekly, No specific weekdays (legacy behavior)
 *   Calculation: 12 × 4.33 ÷ 1 = 51.96 hours/month
 * 
 * Phase 4 Enhancements:
 * - Integrated performance monitoring for matrix calculations
 * - Enhanced integration testing support
 * - System-wide consistency validation
 * - Regression testing safeguards
 */
export class SkillCalculatorCore {
  /**
   * Calculate monthly demand by skill with enhanced weekday-aware calculations
   * 
   * This method processes recurring tasks and calculates accurate demand forecasts
   * by considering specific weekdays for weekly recurring tasks. The calculation
   * ensures proper integration with the matrix visualization system.
   * 
   * @param tasks Array of recurring tasks to process
   * @param monthStart Start date of the calculation period
   * @param monthEnd End date of the calculation period
   * @returns Promise<SkillHours[]> Array of skill demands with calculated hours
   */
  static async calculateMonthlyDemandBySkill(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): Promise<SkillHours[]> {
    const periodMonth = monthStart.getMonth();
    const periodMonthName = monthStart.toLocaleString('default', { month: 'long' });

    console.log('🔍 [SKILL CALCULATOR] Starting Phase 4 enhanced calculation:', {
      tasksCount: tasks.length,
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      periodMonth,
      periodMonthName,
      monitoringActive: MatrixCalculationMonitor.isMonitoringActive()
    });

    // Use performance monitoring if active
    if (MatrixCalculationMonitor.isMonitoringActive()) {
      return MatrixCalculationMonitor.monitorSkillCalculation(
        'monthly-demand-by-skill',
        () => this.performCalculationWithMonitoring(tasks, monthStart, monthEnd, periodMonth, periodMonthName),
        {
          tasksCount: tasks.length,
          periodMonth: periodMonthName,
          hasWeeklyTasks: tasks.some(t => t.recurrence_type?.toLowerCase() === 'weekly'),
          hasAnnualTasks: tasks.some(t => t.recurrence_type?.toLowerCase().includes('annual'))
        }
      );
    } else {
      return this.performCalculationWithMonitoring(tasks, monthStart, monthEnd, periodMonth, periodMonthName);
    }
  }

  /**
   * Perform calculation with integrated monitoring and enhanced weekday processing
   * 
   * This private method handles the core calculation logic while maintaining
   * performance monitoring and ensuring accurate weekday-based calculations
   * for weekly recurring tasks.
   */
  private static async performCalculationWithMonitoring(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date,
    periodMonth: number,
    periodMonthName: string
  ): Promise<SkillHours[]> {
    try {
      // Validate inputs with performance tracking
      const validationStart = performance.now();
      const inputValidation = SkillValidationUtils.validateInputs(tasks, monthStart, monthEnd);
      const validationTime = performance.now() - validationStart;
      
      if (!inputValidation.isValid) {
        console.error('❌ [SKILL CALCULATOR] Input validation failed:', inputValidation.errors);
        MatrixCalculationMonitor.logPerformanceWarning('input-validation', validationTime, 100);
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

      // Validate tasks with performance monitoring
      const taskValidationStart = performance.now();
      const { validTasks, invalidTasks } = await DataValidator.validateRecurringTasks(tasks, { permissive: true });
      const taskValidationTime = performance.now() - taskValidationStart;
      
      console.log('✅ [SKILL CALCULATOR] Task validation results:', {
        totalInput: tasks.length,
        validTasks: validTasks.length,
        invalidTasks: invalidTasks.length,
        validationRate: ((validTasks.length / tasks.length) * 100).toFixed(1) + '%',
        validationTime: taskValidationTime.toFixed(2) + 'ms'
      });

      if (validTasks.length === 0) {
        console.warn('❌ [SKILL CALCULATOR] No valid tasks after validation');
        return [];
      }

      // Process tasks and calculate demand with monitoring
      const processingStart = performance.now();
      const { skillDemandMap, processingStats } = await this.processTasksForDemand(
        validTasks, 
        monthStart, 
        monthEnd,
        periodMonth
      );
      const processingTime = performance.now() - processingStart;

      // Performance warning for slow processing
      MatrixCalculationMonitor.logPerformanceWarning('task-processing', processingTime, 1000);

      // Log processing summary
      this.logProcessingSummary(processingStats, periodMonthName);

      // Convert to SkillHours array with monitoring
      const conversionStart = performance.now();
      const skillHours = SkillDataProcessor.convertToSkillHours(skillDemandMap, periodMonthName);
      const conversionTime = performance.now() - conversionStart;

      // Final results with comprehensive integration metrics
      console.log('🎯 [SKILL CALCULATOR] Phase 4 calculation complete with integration metrics:', {
        skillsWithDemand: skillHours.length,
        totalDemandHours: skillHours.reduce((sum, sh) => sum + sh.hours, 0),
        periodMonth: periodMonthName,
        annualTasksProcessed: processingStats.annualTasksProcessed,
        annualTasksIncluded: processingStats.annualTasksIncluded,
        weeklyTasksProcessed: processingStats.weeklyTasksProcessed || 0, // Added weekly tracking
        performanceMetrics: {
          validationTime: validationTime.toFixed(2) + 'ms',
          taskValidationTime: taskValidationTime.toFixed(2) + 'ms',
          processingTime: processingTime.toFixed(2) + 'ms',
          conversionTime: conversionTime.toFixed(2) + 'ms',
          totalTime: (validationTime + taskValidationTime + processingTime + conversionTime).toFixed(2) + 'ms'
        },
        integrationReady: true,
        matrixCompatible: true,
        topSkills: skillHours.slice(0, 5).map(sh => ({ skill: sh.skill, hours: sh.hours }))
      });

      debugLog(`Phase 4: Calculated demand for ${skillHours.length} skills with enhanced monitoring`);
      return skillHours;

    } catch (error) {
      console.error('❌ [SKILL CALCULATOR] Critical error in Phase 4 calculation:', error);
      return [];
    }
  }

  /**
   * Process all tasks for demand calculation with enhanced weekday-aware processing
   * 
   * This method processes each task through the RecurrenceCalculator, which now
   * includes enhanced weekday calculation logic for weekly recurring tasks.
   * 
   * WEEKDAY PROCESSING LOGIC:
   * - Weekly tasks with weekdays array: Uses accurate weekday-based calculation
   * - Weekly tasks without weekdays: Falls back to legacy 4.33 weeks/month formula
   * - Non-weekly tasks: Processed using existing recurrence logic
   * 
   * @param validTasks Array of validated recurring tasks
   * @param monthStart Start date of calculation period
   * @param monthEnd End date of calculation period
   * @param periodMonth Month number for logging purposes
   * @returns Processing results including skill demand map and statistics
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
      weeklyTasksProcessed: number; // Added weekly tracking
      weeklyTasksWithWeekdays: number; // Added weekday-specific tracking
    };
  }> {
    const skillDemandMap = new Map<SkillType, number>();
    let processedTaskCount = 0;
    let totalCalculatedHours = 0;
    let annualTasksProcessed = 0;
    let annualTasksIncluded = 0;
    let weeklyTasksProcessed = 0;
    let weeklyTasksWithWeekdays = 0;

    console.log('🔄 [SKILL CALCULATOR] Processing tasks for Phase 4 integration...');

    for (const task of validTasks) {
      try {
        processedTaskCount++;
        const isAnnualTask = task.recurrence_type && task.recurrence_type.toLowerCase().includes('annual');
        const isWeeklyTask = task.recurrence_type && task.recurrence_type.toLowerCase() === 'weekly';
        
        if (isAnnualTask) {
          annualTasksProcessed++;
        }
        
        // Enhanced weekly task tracking with weekday analysis
        if (isWeeklyTask) {
          weeklyTasksProcessed++;
          if (task.weekdays && Array.isArray(task.weekdays) && task.weekdays.length > 0) {
            weeklyTasksWithWeekdays++;
          }
        }

        console.log(`📝 [SKILL CALCULATOR] Processing task ${processedTaskCount}/${validTasks.length}:`, {
          taskId: task.id,
          taskName: task.name,
          clientId: task.client_id,
          estimatedHours: task.estimated_hours,
          requiredSkills: task.required_skills,
          recurrenceType: task.recurrence_type,
          isAnnualTask,
          isWeeklyTask,
          hasWeekdays: isWeeklyTask && task.weekdays && Array.isArray(task.weekdays) && task.weekdays.length > 0,
          weekdays: isWeeklyTask ? task.weekdays : 'N/A'
        });

        /**
         * ENHANCED RECURRENCE CALCULATION WITH WEEKDAY SUPPORT
         * 
         * The RecurrenceCalculator.calculateMonthlyDemand method now includes:
         * - Weekday-aware calculations for weekly tasks
         * - Proper validation and fallback mechanisms
         * - Enhanced logging for debugging purposes
         * 
         * Weekly Task Calculation Examples:
         * - Task with weekdays [1,3,5]: 3 days × 4.35 weeks = 13.05 occurrences/month
         * - Task with weekdays [2,4]: 2 days × 4.35 weeks = 8.7 occurrences/month
         * - Task without weekdays: Uses legacy 4.33 weeks/month calculation
         */
        const recurrenceStart = performance.now();
        const recurrenceCalc = RecurrenceCalculator.calculateMonthlyDemand(
          task, 
          monthStart, 
          monthEnd
        );
        const recurrenceTime = performance.now() - recurrenceStart;

        // Log performance warning for slow recurrence calculations
        if (recurrenceTime > 100) {
          console.warn(`⚠️ [SKILL CALCULATOR] Slow recurrence calculation for task ${task.id}: ${recurrenceTime.toFixed(2)}ms`);
        }

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
          isAnnualTask,
          isWeeklyTask,
          calculationTime: recurrenceTime.toFixed(2) + 'ms'
        });

        totalCalculatedHours += recurrenceCalc.monthlyHours;

        // Process each required skill
        SkillDataProcessor.updateSkillDemandMap(
          skillDemandMap,
          task.required_skills,
          recurrenceCalc.monthlyHours,
          { 
            id: task.id, 
            name: task.name, 
            isAnnualTask
          }
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
        annualTasksIncluded,
        weeklyTasksProcessed,
        weeklyTasksWithWeekdays
      }
    };
  }

  /**
   * Log annual tasks analysis with detailed breakdown
   * 
   * Provides comprehensive analysis of annual tasks for debugging and
   * validation purposes, helping ensure accurate monthly inclusion logic.
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
   * Log comprehensive processing summary with enhanced weekly task metrics
   * 
   * Provides detailed breakdown of processing results including specific
   * metrics for weekly tasks with weekday calculations.
   */
  private static logProcessingSummary(
    stats: {
      processedTaskCount: number;
      totalCalculatedHours: number;
      annualTasksProcessed: number;
      annualTasksIncluded: number;
      weeklyTasksProcessed: number;
      weeklyTasksWithWeekdays: number;
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

    // Enhanced processing summary with weekly task metrics
    console.log('📊 [SKILL CALCULATOR] Processing summary:', {
      processedTasks: stats.processedTaskCount,
      totalCalculatedHours: stats.totalCalculatedHours,
      annualTasksProcessed: stats.annualTasksProcessed,
      annualTasksIncluded: stats.annualTasksIncluded,
      annualTasksSkipped: stats.annualTasksProcessed - stats.annualTasksIncluded,
      weeklyTasksProcessed: stats.weeklyTasksProcessed,
      weeklyTasksWithWeekdays: stats.weeklyTasksWithWeekdays,
      weeklyTasksLegacyCalculation: stats.weeklyTasksProcessed - stats.weeklyTasksWithWeekdays,
      weekdayCalculationRate: stats.weeklyTasksProcessed > 0 
        ? `${((stats.weeklyTasksWithWeekdays / stats.weeklyTasksProcessed) * 100).toFixed(1)}%` 
        : 'N/A'
    });
  }
}
