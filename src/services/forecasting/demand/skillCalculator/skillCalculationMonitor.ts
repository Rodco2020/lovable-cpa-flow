
import { debugLog } from '../../logger';
import { MatrixCalculationMonitor } from '../matrixCalculationMonitor';

/**
 * Skill Calculation Monitor
 * 
 * Focused service for monitoring and performance tracking of skill calculations.
 * Extracted from skillCalculatorCore to separate concerns and improve maintainability.
 */
export class SkillCalculationMonitor {
  /**
   * Monitor skill calculation performance with comprehensive metrics
   */
  static async monitorSkillCalculation<T>(
    operationName: string,
    calculationFunction: () => Promise<T>,
    context: {
      tasksCount: number;
      periodMonth: string;
      hasWeeklyTasks: boolean;
      hasAnnualTasks: boolean;
    }
  ): Promise<T> {
    const startTime = performance.now();
    
    console.log('📊 [SKILL MONITOR] Starting monitored calculation:', {
      operation: operationName,
      ...context,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await calculationFunction();
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Log successful completion with metrics
      this.logSuccessfulCalculation(operationName, processingTime, context);

      // Check for performance warnings
      this.checkPerformanceThresholds(operationName, processingTime, context);

      // Update global monitoring if active
      if (MatrixCalculationMonitor.isMonitoringActive()) {
        MatrixCalculationMonitor.logPerformanceWarning(
          `${operationName}-skill-calculation`,
          processingTime,
          this.getPerformanceThreshold(operationName, context)
        );
      }

      return result;

    } catch (error) {
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      this.logCalculationError(operationName, error, processingTime, context);
      throw error;
    }
  }

  /**
   * Log successful calculation with detailed metrics
   */
  private static logSuccessfulCalculation(
    operationName: string,
    processingTime: number,
    context: any
  ): void {
    console.log('✅ [SKILL MONITOR] Calculation completed successfully:', {
      operation: operationName,
      processingTime: processingTime.toFixed(2) + 'ms',
      tasksProcessed: context.tasksCount,
      periodMonth: context.periodMonth,
      specialFeatures: {
        weeklyTasks: context.hasWeeklyTasks,
        annualTasks: context.hasAnnualTasks
      },
      performanceRating: this.getPerformanceRating(processingTime, context)
    });
  }

  /**
   * Log calculation errors with context
   */
  private static logCalculationError(
    operationName: string,
    error: any,
    processingTime: number,
    context: any
  ): void {
    console.error('❌ [SKILL MONITOR] Calculation failed:', {
      operation: operationName,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: processingTime.toFixed(2) + 'ms',
      context,
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  /**
   * Check performance thresholds and log warnings
   */
  private static checkPerformanceThresholds(
    operationName: string,
    processingTime: number,
    context: any
  ): void {
    const threshold = this.getPerformanceThreshold(operationName, context);
    
    if (processingTime > threshold) {
      console.warn(`⚠️ [SKILL MONITOR] Performance warning for ${operationName}:`, {
        actualTime: processingTime.toFixed(2) + 'ms',
        threshold: threshold + 'ms',
        exceedBy: (processingTime - threshold).toFixed(2) + 'ms',
        tasksCount: context.tasksCount,
        suggestions: this.getPerformanceSuggestions(operationName, context)
      });
    }
  }

  /**
   * Get performance threshold based on operation and context
   */
  private static getPerformanceThreshold(operationName: string, context: any): number {
    const baseThreshold = 1000; // 1 second base
    let threshold = baseThreshold;

    // Adjust based on task count
    if (context.tasksCount > 100) {
      threshold += (context.tasksCount - 100) * 10; // 10ms per additional task
    }

    // Adjust for complex features
    if (context.hasWeeklyTasks) {
      threshold += 200; // Additional time for weekday calculations
    }

    if (context.hasAnnualTasks) {
      threshold += 300; // Additional time for annual task processing
    }

    return threshold;
  }

  /**
   * Get performance rating based on processing time
   */
  private static getPerformanceRating(processingTime: number, context: any): string {
    const threshold = this.getPerformanceThreshold('calculation', context);
    
    if (processingTime < threshold * 0.5) return 'Excellent';
    if (processingTime < threshold * 0.75) return 'Good';
    if (processingTime < threshold) return 'Acceptable';
    if (processingTime < threshold * 1.5) return 'Slow';
    return 'Critical';
  }

  /**
   * Get performance improvement suggestions
   */
  private static getPerformanceSuggestions(operationName: string, context: any): string[] {
    const suggestions: string[] = [];

    if (context.tasksCount > 200) {
      suggestions.push('Consider implementing task processing batching');
    }

    if (context.hasWeeklyTasks && context.tasksCount > 50) {
      suggestions.push('Cache weekday calculations for repeated patterns');
    }

    if (context.hasAnnualTasks) {
      suggestions.push('Pre-filter annual tasks by month to reduce processing');
    }

    return suggestions;
  }

  /**
   * Log processing statistics for analysis
   */
  static logProcessingStats(stats: {
    processedTaskCount: number;
    totalCalculatedHours: number;
    annualTasksProcessed: number;
    annualTasksIncluded: number;
    weeklyTasksProcessed: number;
    weeklyTasksWithWeekdays: number;
  }, periodMonthName: string): void {
    console.log('📊 [SKILL MONITOR] Processing statistics:', {
      summary: {
        processedTasks: stats.processedTaskCount,
        totalCalculatedHours: stats.totalCalculatedHours,
        periodMonth: periodMonthName
      },
      annualTasks: {
        processed: stats.annualTasksProcessed,
        included: stats.annualTasksIncluded,
        skipped: stats.annualTasksProcessed - stats.annualTasksIncluded,
        inclusionRate: stats.annualTasksProcessed > 0 
          ? `${((stats.annualTasksIncluded / stats.annualTasksProcessed) * 100).toFixed(1)}%` 
          : 'N/A'
      },
      weeklyTasks: {
        processed: stats.weeklyTasksProcessed,
        withWeekdays: stats.weeklyTasksWithWeekdays,
        legacyCalculation: stats.weeklyTasksProcessed - stats.weeklyTasksWithWeekdays,
        weekdayCalculationRate: stats.weeklyTasksProcessed > 0 
          ? `${((stats.weeklyTasksWithWeekdays / stats.weeklyTasksProcessed) * 100).toFixed(1)}%` 
          : 'N/A'
      }
    });
  }

  /**
   * Track individual task processing performance
   */
  static trackTaskProcessing(
    taskId: string,
    processingTime: number,
    context: {
      isAnnualTask: boolean;
      isWeeklyTask: boolean;
      hasWeekdays: boolean;
      monthlyHours: number;
    }
  ): void {
    if (processingTime > 100) {
      console.warn(`⚠️ [SKILL MONITOR] Slow task processing for ${taskId}:`, {
        processingTime: processingTime.toFixed(2) + 'ms',
        taskType: context.isAnnualTask ? 'Annual' : context.isWeeklyTask ? 'Weekly' : 'Standard',
        hasWeekdayCalculation: context.hasWeekdays,
        monthlyHours: context.monthlyHours
      });
    }
  }
}
