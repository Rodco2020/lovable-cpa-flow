
import { RecurringTaskDB } from '@/types/task';

export interface AnnualTaskTracking {
  taskId: string;
  taskName: string;
  clientId: string;
  estimatedHours: number;
  calculatedHours: number;
  wasIncluded: boolean;
  reason: string;
}

/**
 * Annual task tracking utilities for enhanced debugging
 */
export class AnnualTaskTracker {
  private static tracker = new Map<string, AnnualTaskTracking>();

  /**
   * Track an annual task's calculation result
   */
  static trackAnnualTask(
    task: RecurringTaskDB,
    calculatedHours: number,
    periodMonth: number
  ): void {
    const wasIncluded = calculatedHours > 0;
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

    this.tracker.set(task.id, {
      taskId: task.id,
      taskName: task.name,
      clientId: task.client_id,
      estimatedHours: Number(task.estimated_hours),
      calculatedHours,
      wasIncluded,
      reason
    });

    console.log(`📊 [ANNUAL TASK TRACKING] ${task.name} (${task.id}):`, {
      estimatedHours: task.estimated_hours,
      calculatedHours,
      wasIncluded,
      reason,
      monthOfYear: task.month_of_year,
      dueDate: task.due_date
    });
  }

  /**
   * Get all tracked annual tasks
   */
  static getAllTrackedTasks(): AnnualTaskTracking[] {
    return Array.from(this.tracker.values());
  }

  /**
   * Clear the tracker
   */
  static clearTracker(): void {
    this.tracker.clear();
  }

  /**
   * Get summary statistics
   */
  static getSummary(): {
    totalAnnualTasks: number;
    includedAnnualTasks: number;
    excludedAnnualTasks: number;
  } {
    const tasks = this.getAllTrackedTasks();
    const includedCount = tasks.filter(task => task.wasIncluded).length;
    
    return {
      totalAnnualTasks: tasks.length,
      includedAnnualTasks: includedCount,
      excludedAnnualTasks: tasks.length - includedCount
    };
  }

  /**
   * Predict if an annual task should be included in the current period
   */
  static predictAnnualTaskInclusion(task: RecurringTaskDB, periodMonth: number): {
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
}
