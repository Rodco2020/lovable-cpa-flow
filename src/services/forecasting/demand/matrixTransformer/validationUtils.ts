
import { DemandMatrixData } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { MonthlyDemandCalculationService } from './monthlyDemandCalculationService';

/**
 * Validation utilities for matrix transformation
 */
export class MatrixValidationUtils {
  /**
   * Validate that tasks only appear in correct months
   */
  static validateTaskMonthMapping(
    matrixData: DemandMatrixData,
    originalTasks: RecurringTaskDB[]
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('🔍 [MATRIX VALIDATION] Validating task-month mapping...');

    // Check each data point
    for (const dataPoint of matrixData.dataPoints) {
      for (const taskBreakdown of dataPoint.taskBreakdown) {
        const originalTask = originalTasks.find(task => task.id === taskBreakdown.recurringTaskId);
        
        if (!originalTask) {
          errors.push(`Task ${taskBreakdown.recurringTaskId} not found in original tasks`);
          continue;
        }

        // Validate that the task should actually appear in this month
        const shouldAppear = MonthlyDemandCalculationService.shouldTaskAppearInMonth(
          originalTask,
          dataPoint.month
        );

        if (!shouldAppear) {
          errors.push(
            `Task "${taskBreakdown.taskName}" (${taskBreakdown.recurringTaskId}) ` +
            `should not appear in month ${dataPoint.month} based on its recurrence pattern ` +
            `(${originalTask.recurrence_type}, interval: ${originalTask.recurrence_interval})`
          );
        }

        // Validate monthly hours calculation
        const expectedDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(
          originalTask,
          dataPoint.month
        );

        if (Math.abs(taskBreakdown.monthlyHours - expectedDemand.monthlyHours) > 0.01) {
          warnings.push(
            `Task "${taskBreakdown.taskName}" in month ${dataPoint.month} ` +
            `has incorrect monthly hours: expected ${expectedDemand.monthlyHours}, ` +
            `got ${taskBreakdown.monthlyHours}`
          );
        }
      }
    }

    const isValid = errors.length === 0;

    console.log('✅ [MATRIX VALIDATION] Validation complete:', {
      isValid,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      totalDataPoints: matrixData.dataPoints.length,
      totalTaskBreakdowns: matrixData.dataPoints.reduce((sum, dp) => sum + dp.taskBreakdown.length, 0)
    });

    return {
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Log matrix transformation statistics for debugging
   */
  static logTransformationStats(
    matrixData: DemandMatrixData,
    originalTasks: RecurringTaskDB[]
  ): void {
    console.log('📊 [MATRIX STATS] Transformation Statistics:');
    
    // Calculate task appearances across months
    const taskAppearances = new Map<string, string[]>();
    
    for (const dataPoint of matrixData.dataPoints) {
      for (const taskBreakdown of dataPoint.taskBreakdown) {
        const taskId = taskBreakdown.recurringTaskId;
        if (!taskAppearances.has(taskId)) {
          taskAppearances.set(taskId, []);
        }
        taskAppearances.get(taskId)!.push(dataPoint.month);
      }
    }

    console.log('📊 [MATRIX STATS] Task distribution:');
    console.log(`- Total original tasks: ${originalTasks.length}`);
    console.log(`- Tasks appearing in matrix: ${taskAppearances.size}`);
    console.log(`- Total data points: ${matrixData.dataPoints.length}`);
    console.log(`- Average data points per month: ${(matrixData.dataPoints.length / matrixData.months.length).toFixed(2)}`);

    // Show sample of task month appearances
    const sampleTasks = Array.from(taskAppearances.entries()).slice(0, 5);
    console.log('📊 [MATRIX STATS] Sample task appearances:');
    sampleTasks.forEach(([taskId, months]) => {
      const task = originalTasks.find(t => t.id === taskId);
      console.log(`- Task "${task?.name}" (${task?.recurrence_type}): appears in ${months.length} months: ${months.join(', ')}`);
    });
  }
}
